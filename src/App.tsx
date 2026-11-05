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
}

const API_URL = "http://localhost:5000/api/tasks";

// Cấu hình màu sắc và nhãn hiển thị cho từng cấp độ
const PRIORITY_CONFIG = {
  high: {
    label: "Cấp 1: Quan trọng (Đỏ)",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
  medium: {
    label: "Cấp 2: Vừa phải (Vàng)",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  low: {
    label: "Cấp 3: Ít quan trọng (Xanh)",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
  },
};

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityLevel | "">("");
  // State quản lý Task đang được chọn để sửa (null = chế độ Thêm mới)
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingTask) {
      // Chế độ Sửa: Gọi API PUT
      await axios.put(`${API_URL}/${editingTask.id}`, {
        ...editingTask,
        title,
        description,
        priority,
      });
      setEditingTask(null);
    } else {
      // Chế độ Thêm mới: Gọi API POST
      await axios.post(API_URL, { title, description, priority });
    }
    setTitle("");
    setDescription("");
    setPriority("medium");
    fetchTasks();
  };

  // Nạp dữ liệu của Task vào form khi nhấn nút "Sửa"
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority || "medium");
  };

  // Hủy chế độ sửa (quay về Thêm mới)
  const handleCancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  const toggleTask = async (task: Task) => {
    await axios.put(`${API_URL}/${task.id}`, {
      ...task,
      completed: !task.completed,
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    // Nếu đang sửa đúng task bị xóa thì reset form
    if (editingTask && editingTask.id === id) {
      handleCancelEdit();
    }
    await axios.delete(`${API_URL}/${id}`);
    fetchTasks();
  };

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
        {/* Select Mức độ quan trọng ngay dưới Mô tả */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            boxSizing: "border-box",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
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

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => {
          const priorityInfo =
            PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
          return (
            <li
              key={task.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                marginBottom: "8px",
                borderLeft: `5px solid ${priorityInfo.color}`,
                backgroundColor: priorityInfo.bg,
                borderRadius: "4px",
                borderTop: "1px solid #eee",
                borderRight: "1px solid #eee",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    onClick={() => toggleTask(task)}
                    style={{
                      cursor: "pointer",
                      textDecoration: task.completed ? "line-through" : "none",
                      fontWeight: "bold",
                      fontSize: "16px",
                      textAlign: "left",
                      color: task.completed ? "#999" : "#000",
                    }}
                  >
                    {task.title}
                  </span>

                  {/* Badge Mức độ quan trọng */}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: priorityInfo.color,
                      border: `1px solid ${priorityInfo.border}`,
                      backgroundColor: "#fff",
                      padding: "2px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {priorityInfo.shortLabel}
                  </span>
                </div>

                {task.description && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#666",
                      textAlign: "left",
                    }}
                  >
                    {task.description}
                  </p>
                )}
                {task.createdAt && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "12px",
                      color: "#999",
                      textAlign: "left",
                    }}
                  >
                    Ngày tạo: {new Date(task.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Cụm nút hành động căn bên phải */}
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
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
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default App;
