import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

const API_URL = 'http://localhost:5000/api/tasks';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchTasks = async () => {
    const res = await axios.get(API_URL);
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await axios.post(API_URL, { title, description });
    setTitle('');
    setDescription('');
    fetchTasks();
  };

  const toggleTask = async (task: Task) => {
    await axios.put(`${API_URL}/${task.id}`, {
      ...task,
      completed: !task.completed
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchTasks();
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Task Manager (Electron + React)</h2>
      
      <form onSubmit={handleAddTask} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tên nhiệm vụ..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="text"
          placeholder="Mô tả..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Thêm nhiệm vụ</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              borderBottom: '1px solid #ccc'
            }}
          >
            <div>
              <span
                onClick={() => toggleTask(task)}
                style={{
                  cursor: 'pointer',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  fontWeight: 'bold'
                }}
              >
                {task.title}
              </span>
              {task.description && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{task.description}</p>}
            </div>
            <button onClick={() => deleteTask(task.id)} style={{ color: 'red' }}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;