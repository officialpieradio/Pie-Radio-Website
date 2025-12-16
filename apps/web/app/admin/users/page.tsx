"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@packages/types";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const supabase = createClient();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false }); // Assuming created_at exists on profile, if not, remove order or use id

            if (!error && data) {
                setUsers(data);
            }
            setLoading(false);
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-400 font-medium border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                {/* <th className="px-6 py-4 text-right">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                                                    {user.username?.substring(0, 2).toUpperCase() || "??"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.full_name || "No Name"}</p>
                                                    <p className="text-zinc-500 text-xs">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                                                    : user.role === 'presenter'
                                                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                        : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                                }`}>
                                                {user.role || 'listener'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400">
                                            {/* Handle case where created_at might not exist on profile depending on migration */}
                                            Active
                                        </td>
                                        {/* <td className="px-6 py-4 text-right">
                                    <button className="text-zinc-400 hover:text-white">Edit</button>
                                </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
