import React, { useEffect, useState } from "react";
import axios from "axios";

export type PriorityLevel = "high" | "medium" | "low";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  priority: PriorityLevel;
  parentId?: number | null;
  subtasks?: Task[];
}

const API_URL = "http://localhost:5000/api/tasks";

const getPriorityInfo = (priority: PriorityLevel) => {
  switch (priority) {
    case "high":
      return { label: "Cấp 1", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" };
    case "medium":
      return { label: "Cấp 2", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
    case "low":
      return { label: "Cấp 3", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" };
    default:
      return { label: "Cấp 2", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  }
};

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityLevel | "">("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // State quản lý Modal Subtask
  const [parentTaskForSubtask, setParentTaskForSubtask] = useState<Task | null>(null);
  const [subTitle, setSubTitle] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subPriority, setSubPriority] = useState<PriorityLevel>("medium");

  // State quản lý xem thêm/thu gọn subtask
  const [expandedTasks, setExpandedTasks] = useState<{ [key: number]: boolean }>({});

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách nhiệm vụ:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // LỰA CHỌN THÔNG MINH: Tự nhóm Task thành cấu trúc Cha - Con tại Frontend
  const buildTaskTree = (flatTasks: Task[]): Task[] => {
    const taskMap: { [key: number]: Task } = {};
    const rootTasks: Task[] = [];

    // Khởi tạo map cho từng task kèm mảng subtasks rỗng
    flatTasks.forEach((task) => {
      taskMap[task.id] = { ...task, subtasks: task.subtasks ? [...task.subtasks] : [] };
    });

    // Gom task con vào task cha tương ứng
    flatTasks.forEach((task) => {
      if (task.parentId && taskMap[task.parentId]) {
        // Kiểm tra tránh trùng lặp nếu backend đã include sẵn
        const exists = taskMap[task.parentId].subtasks?.some((sub) => sub.id === task.id);
        if (!exists) {
          taskMap[task.parentId].subtasks?.push(taskMap[task.id]);
        }
      } else if (!task.parentId) {
        rootTasks.push(taskMap[task.id]);
      }
    });

    return rootTasks;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const selectedPriority = priority || "medium";
    if (editingTask) {
      await axios.put(`${API_URL}/${editingTask.id}`, {
        ...editingTask,
        title,
        description,
        priority: selectedPriority,
      });
      setEditingTask(null);
    } else {
      await axios.post(API_URL, {
        title,
        description,
        priority: selectedPriority,
      });
    }
    setTitle("");
    setDescription("");
    setPriority("");
    fetchTasks();
  };

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim() || !parentTaskForSubtask) return;

    await axios.post(API_URL, {
      title: subTitle,
      description: subDescription,
      priority: subPriority,
      parentId: parentTaskForSubtask.id,
    });

    setParentTaskForSubtask(null);
    setSubTitle("");
    setSubDescription("");
    setSubPriority("medium");
    fetchTasks();
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority || "medium");
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("");
  };

  const toggleTask = async (task: Task) => {
    await axios.put(`${API_URL}/${task.id}`, {
      ...task,
      completed: !task.completed,
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    if (editingTask && editingTask.id === id) {
      handleCancelEdit();
    }
    await axios.delete(`${API_URL}/${id}`);
    fetchTasks();
  };

  const toggleExpandSubtasks = (taskId: number) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Render Subtask (Thụt vào 10px)
  const renderSubtaskItem = (subtask: Task) => {
    const priorityInfo = getPriorityInfo(subtask.priority);

    return (
      <div
        key={subtask.id}
        style={{
          marginLeft: "10px",
          marginTop: "6px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          borderLeft: `4px solid ${priorityInfo.color}`,
          backgroundColor: priorityInfo.bg,
          borderRadius: "4px",
          border: "1px solid #eee",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              onClick={() => toggleTask(subtask)}
              style={{
                cursor: "pointer",
                textDecoration: subtask.completed ? "line-through" : "none",
                fontWeight: "bold",
                fontSize: "14px",
                color: subtask.completed ? "#999" : "#000",
              }}
            >
              {subtask.title}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                color: priorityInfo.color,
                border: `1px solid ${priorityInfo.border}`,
                backgroundColor: "#fff",
                padding: "1px 6px",
                borderRadius: "8px",
              }}
            >
              {priorityInfo.label}
            </span>
          </div>

          {subtask.description && (
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#666" }}>
              {subtask.description}
            </p>
          )}
          {subtask.createdAt && (
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#999" }}>
              Ngày tạo: {new Date(subtask.createdAt).toLocaleString()}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            onClick={() => handleEditClick(subtask)}
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              cursor: "pointer",
              color: "#0066cc",
              borderColor: "#0066cc",
              backgroundColor: "#fff",
              borderRadius: "4px",
            }}
          >
            Sửa
          </button>
          <button
            onClick={() => deleteTask(subtask.id)}
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              cursor: "pointer",
              color: "red",
              borderColor: "red",
              backgroundColor: "#fff",
              borderRadius: "4px",
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    );
  };

  // Render Task Cha
  const renderParentTask = (task: Task) => {
    const priorityInfo = getPriorityInfo(task.priority);
    const subtasks = task.subtasks || [];
    const isExpanded = !!expandedTasks[task.id];
    const visibleSubtasks = isExpanded ? subtasks : subtasks.slice(0, 3);

    return (
      <li key={task.id} style={{ marginBottom: "16px", listStyle: "none" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            borderLeft: `6px solid ${priorityInfo.color}`,
            backgroundColor: priorityInfo.bg,
            borderRadius: "4px",
            borderTop: "1px solid #eee",
            borderRight: "1px solid #eee",
            borderBottom: "1px solid #eee",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                onClick={() => toggleTask(task)}
                style={{
                  cursor: "pointer",
                  textDecoration: task.completed ? "line-through" : "none",
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: task.completed ? "#999" : "#000",
                }}
              >
                {task.title}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: priorityInfo.color,
                  border: `1px solid ${priorityInfo.border}`,
                  backgroundColor: "#fff",
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                {priorityInfo.label}
              </span>
            </div>

            {task.description && (
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#666" }}>
                {task.description}
              </p>
            )}
            {task.createdAt && (
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
                Ngày tạo: {new Date(task.createdAt).toLocaleString()}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              onClick={() => setParentTaskForSubtask(task)}
              style={{
                padding: "4px 10px",
                cursor: "pointer",
                color: "#16a34a",
                borderColor: "#16a34a",
                backgroundColor: "#fff",
                borderRadius: "4px",
              }}
            >
              Thêm
            </button>
            <button
              onClick={() => handleEditClick(task)}
              style={{
                padding: "4px 10px",
                cursor: "pointer",
                color: "#0066cc",
                borderColor: "#0066cc",
                backgroundColor: "#fff",
                borderRadius: "4px",
              }}
            >
              Sửa
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              style={{
                padding: "4px 10px",
                cursor: "pointer",
                color: "red",
                borderColor: "red",
                backgroundColor: "#fff",
                borderRadius: "4px",
              }}
            >
              Xóa
            </button>
          </div>
        </div>

        {/* Khối chứa Subtask thụt vào 10px */}
        {subtasks.length > 0 && (
          <div style={{ marginTop: "4px" }}>
            {visibleSubtasks.map((subtask) => renderSubtaskItem(subtask))}

            {subtasks.length > 3 && (
              <div style={{ marginLeft: "10px", marginTop: "6px" }}>
                <button
                  onClick={() => toggleExpandSubtasks(task.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0066cc",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    padding: 0,
                  }}
                >
                  {isExpanded
                    ? "▲ Thu gọn"
                    : `▼ Xem thêm ${subtasks.length - 3} nhiệm vụ con...`}
                </button>
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  const rootTasks = buildTaskTree(tasks);

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h2>Task Manager (Electron + React)</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Tên nhiệm vụ..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            boxSizing: "border-box",
            marginBottom: "8px",
          }}
        />
        <input
          type="text"
          placeholder="Mô tả..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "8px",
            boxSizing: "border-box",
          }}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "8px",
            boxSizing: "border-box",
            border: "1px solid #767676",
            borderRadius: "2px",
            backgroundColor: "#fff",
            color: priority === "" ? "#757575" : "#000",
            cursor: "pointer",
          }}
        >
          <option value="" disabled hidden>
            -- Chọn mức độ quan trọng --
          </option>
          <option value="high">Cấp 1: Quan trọng (Đỏ)</option>
          <option value="medium">Cấp 2: Vừa phải (Vàng)</option>
          <option value="low">Cấp 3: Ít quan trọng (Xanh)</option>
        </select>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <button
            type="submit"
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            {editingTask ? "Cập nhật nhiệm vụ" : "Thêm nhiệm vụ"}
          </button>

          {editingTask && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: "#ccc",
                border: "none",
              }}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Danh sách Task được render từ rootTasks */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {rootTasks.map((task) => renderParentTask(task))}
      </ul>

      {/* Modal Thêm Subtask */}
      {parentTaskForSubtask && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "6px",
              width: "400px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Thêm nhiệm vụ con</h3>

            <form onSubmit={handleAddSubtaskSubmit}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "12px", color: "#666" }}>
                  Nhiệm vụ cha:
                </label>
                <input
                  type="text"
                  value={parentTaskForSubtask.title}
                  disabled
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                    backgroundColor: "#f0f0f0",
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <input
                  type="text"
                  placeholder="Tên nhiệm vụ con..."
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <input
                  type="text"
                  placeholder="Mô tả nhiệm vụ con..."
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <select
                  value={subPriority}
                  onChange={(e) =>
                    setSubPriority(e.target.value as PriorityLevel)
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="high">Cấp 1: Quan trọng (Đỏ)</option>
                  <option value="medium">Cấp 2: Vừa phải (Vàng)</option>
                  <option value="low">Cấp 3: Ít quan trọng (Xanh)</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setParentTaskForSubtask(null)}
                  style={{
                    padding: "6px 14px",
                    cursor: "pointer",
                    backgroundColor: "#ccc",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "6px 14px",
                    cursor: "pointer",
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;