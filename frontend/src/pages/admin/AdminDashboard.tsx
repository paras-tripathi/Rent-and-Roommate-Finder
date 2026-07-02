import { useState } from 'react';
import { Users, Home, MessageCircle, TrendingUp, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'overview' | 'users' | 'listings'>('overview');
  const [userSearch, setUserSearch] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminAPI.getStats().then(r => r.data),
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers', userSearch],
    queryFn: () => adminAPI.getUsers({ search: userSearch, limit: 50 }).then(r => r.data),
    enabled: tab === 'users',
  });

  const { data: listingsData } = useQuery({
    queryKey: ['adminListings'],
    queryFn: () => adminAPI.getListings({ limit: 50 }).then(r => r.data),
    enabled: tab === 'listings',
  });

  const handleToggleUser = async (id: string) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch {
      toast.error('Failed to toggle user status');
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-primary-500', sub: `${stats.tenants} tenants, ${stats.owners} owners` },
    { label: 'Total Listings', value: stats.listings, icon: Home, color: 'text-emerald-500', sub: `${stats.activeListings} active, ${stats.filledListings} filled` },
    { label: 'Interests', value: stats.interests, icon: TrendingUp, color: 'text-amber-500', sub: `${stats.acceptedInterests} accepted` },
    { label: 'Chat Rooms', value: stats.chatRooms, icon: MessageCircle, color: 'text-violet-500', sub: `${stats.messages} messages` },
  ] : [];

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-dark-400 text-sm">Platform control center</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(s => (
              <div key={s.label} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-dark-500">{s.label}</span>
                  <s.icon size={20} className={s.color} />
                </div>
                <p className="text-3xl font-bold mb-1">{s.value}</p>
                <p className="text-xs text-dark-400">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-dark-200 dark:border-dark-800">
          {(['overview', 'users', 'listings'] as const).map(id => (
            <button key={id} id={`admin-tab-${id}`} onClick={() => setTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${
              tab === id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
            }`}>{id}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-4">User Distribution</h3>
              <div className="space-y-3">
                {[['Tenants', stats.tenants, stats.users, 'bg-primary-500'], ['Owners', stats.owners, stats.users, 'bg-emerald-500']].map(([label, val, total, color]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label as string}</span>
                      <span className="font-medium">{val as number}</span>
                    </div>
                    <div className="h-2 bg-dark-100 dark:bg-dark-800 rounded-full">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${((val as number) / (total as number)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Listing Status</h3>
              <div className="space-y-3">
                {[['Active', stats.activeListings, stats.listings, 'bg-emerald-500'], ['Filled', stats.filledListings, stats.listings, 'bg-amber-500']].map(([label, val, total, color]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label as string}</span>
                      <span className="font-medium">{val as number}</span>
                    </div>
                    <div className="h-2 bg-dark-100 dark:bg-dark-800 rounded-full">
                      <div className={`h-full ${color} rounded-full`} style={{ width: total ? `${((val as number) / (total as number)) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <input type="text" className="input mb-4 max-w-sm" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-800">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-dark-500">Name</th>
                    <th className="px-4 py-3 text-sm font-medium text-dark-500">Email</th>
                    <th className="px-4 py-3 text-sm font-medium text-dark-500">Role</th>
                    <th className="px-4 py-3 text-sm font-medium text-dark-500">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-dark-500">Joined</th>
                    <th className="px-4 py-3 text-sm font-medium text-dark-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                  {usersData?.users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-sm">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-dark-500">{u.email}</td>
                      <td className="px-4 py-3"><span className={`badge ${u.role === 'TENANT' ? 'badge-blue' : u.role === 'OWNER' ? 'badge-purple' : 'badge-red'}`}>{u.role}</span></td>
                      <td className="px-4 py-3"><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-4 py-3 text-sm text-dark-400">{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3">
                        <button id={`toggle-user-${u.id}`} onClick={() => handleToggleUser(u.id)} className="btn-ghost p-1" title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} className="text-dark-400" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Listings */}
        {tab === 'listings' && (
          <div className="space-y-4">
            {listingsData?.listings?.map((l: any) => (
              <div key={l.id} className="card p-4 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <img src={l.images?.[0]?.url || `https://picsum.photos/seed/${l.id}/100`} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium text-sm">{l.title}</p>
                    <p className="text-xs text-dark-400">{l.location} • By {l.owner?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${l.status === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>{l.status}</span>
                  <span className="text-sm font-medium">₹{l.rent?.toLocaleString()}</span>
                  <span className="badge badge-blue">{l._count?.interests || 0} interests</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
