"use client";
import { useEffect, useState } from "react";
import { getUsers, registerUser, deleteUser } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "creator" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = () => getUsers().then((r) => setUsers(r.data));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      setMsg("✅ User created");
      setForm({ name: "", email: "", password: "", role: "creator" });
      fetchUsers();
    } catch (err: any) {
      setMsg(`❌ ${err.response?.data?.detail || "Error"}`);
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    await deleteUser(id);
    fetchUsers();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">User Management</h1>

      {/* Create user form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Add New User</h2>
        {msg && <div className="mb-4 text-sm text-gray-300">{msg}</div>}
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="jane@example.com" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
              <option value="creator">Creator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-span-2">
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-6 py-2 rounded-lg transition-colors">
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      {/* Users list */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">All Users ({users.length})</h2>
        </div>
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-800 last:border-0">
            <div>
              <p className="text-white font-medium">{u.name}</p>
              <p className="text-sm text-gray-400">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-gray-700 text-gray-400"}`}>
                {u.role}
              </span>
              <button onClick={() => remove(u.id, u.name)}
                className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg transition-colors">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
