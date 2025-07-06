// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/useStore'; // Assuming useUserStore gives you isAdmin
import LoadingSpinner from '@/components/layout/loading-spinner'; // Ensure this component exists

interface UserData {
  id: string;
  walletAddress: string;
  points: number;
  cryptoBalance: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function ManageUsersPage() {
  const { walletAddress: currentUserWallet } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [userFound, setUserFound] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [allUsersLoading, setAllUsersLoading] = useState(true);

  const fetchAllUsers = useCallback(async () => {
    setAllUsersLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': currentUserWallet!,
        },
      });
      if (response.ok) {
        const data: UserData[] = await response.json();
        setAllUsers(data);
      } else {
        setMessage(`Failed to fetch all users: ${response.statusText}`);
      }
    } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      setMessage(`Failed to fetch all users: ${errorMessage}`);
      console.error(err);
    } finally {
      setAllUsersLoading(false);
    }
  }, [currentUserWallet]);

  useEffect(() => {
    if (currentUserWallet) {
      fetchAllUsers();
    }
  }, [currentUserWallet, fetchAllUsers]);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage('Please enter a wallet address to search.');
      setUserFound(null);
      return;
    }

    setLoading(true);
    setMessage(null);
    setUserFound(null);

    // Instead of a dedicated search API, we'll filter from allUsers client-side
    // for simplicity, or implement a dedicated search endpoint if dataset is large.
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const foundUser = allUsers.find(user => user.walletAddress.toLowerCase() === normalizedSearchTerm || user.id.toLowerCase() === normalizedSearchTerm);

    if (foundUser) {
      setUserFound(foundUser);
      setMessage(null);
    } else {
      setMessage('User not found.');
      setUserFound(null);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (targetWalletAddress: string, newAdminStatus: boolean) => {
    if (!currentUserWallet) {
      setMessage('Your wallet is not connected.');
      return;
    }

    if (targetWalletAddress.toLowerCase() === currentUserWallet.toLowerCase()) {
      setMessage('You cannot change your own admin status through this panel.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': currentUserWallet, // Admin's wallet for authentication
        },
        body: JSON.stringify({
          targetWalletAddress: targetWalletAddress,
          isAdmin: newAdminStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Refresh the user list and the found user's status
        fetchAllUsers();
        if (userFound && userFound.id.toLowerCase() === targetWalletAddress.toLowerCase()) {
          setUserFound(prev => prev ? { ...prev, isAdmin: newAdminStatus } : null);
        }
      } else {
        setMessage(`Failed to update role: ${data.error || response.statusText}`);
      }
    } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      setMessage(`Failed to fetch events: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-900 text-white p-8"> {/* Adjusted min-height for header */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Manage User Roles</h1>

        <form onSubmit={handleSearch} className="mb-8 p-4 bg-gray-700 rounded-md">
          <label htmlFor="searchWallet" className="block text-gray-300 text-sm font-bold mb-2">Search by Wallet Address:</label>
          <div className="flex space-x-3">
            <input
              type="text"
              id="searchWallet"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter user's wallet address"
              className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-600 border-gray-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {message && (
          <p className={`mb-4 text-center font-medium ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        {userFound && (
          <div className="mb-8 p-4 bg-gray-700 rounded-md">
            <h2 className="text-xl font-semibold mb-3">User Details:</h2>
            <p><strong>Wallet:</strong> <span className="break-all">{userFound.walletAddress}</span></p>
            <p><strong>Admin Status:</strong> <span className={userFound.isAdmin ? 'text-green-400' : 'text-red-400'}>{userFound.isAdmin ? 'Admin' : 'Regular User'}</span></p>
            <p><strong>Points:</strong> {userFound.points}</p>
            <p><strong>Crypto Balance:</strong> {parseFloat(userFound.cryptoBalance).toFixed(4)} USDC</p>
            <p><strong>Joined:</strong> {new Date(userFound.createdAt).toLocaleDateString()}</p>

            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleUpdateRole(userFound.id, !userFound.isAdmin)}
                disabled={loading || userFound.id.toLowerCase() === currentUserWallet?.toLowerCase()}
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition duration-300
                  ${userFound.isAdmin ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {userFound.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
              </button>
            </div>
            {userFound.id.toLowerCase() === currentUserWallet?.toLowerCase() && (
              <p className="text-red-400 text-sm mt-2 text-center">You cannot change your own admin status here.</p>
            )}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4 text-center text-purple-400">All Users</h2>
        {allUsersLoading ? (
          <div className="text-center">
            <LoadingSpinner message="Fetching all users..." />
          </div>
        ) : (
          allUsers.length === 0 ? (
            <p className="text-center text-gray-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-600 text-left">
                    <th className="py-2 px-4 border-b border-gray-500">Wallet Address</th>
                    <th className="py-2 px-4 border-b border-gray-500">Admin</th>
                    <th className="py-2 px-4 border-b border-gray-500">Points</th>
                    <th className="py-2 px-4 border-b border-gray-500">Crypto</th>
                    <th className="py-2 px-4 border-b border-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600">
                      <td className="py-2 px-4 text-sm break-all">{user.walletAddress}</td>
                      <td className="py-2 px-4 text-sm">
                        <span className={user.isAdmin ? 'text-green-400' : 'text-red-400'}>
                          {user.isAdmin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm">{user.points}</td>
                      <td className="py-2 px-4 text-sm">{parseFloat(user.cryptoBalance).toFixed(2)}</td>
                      <td className="py-2 px-4 text-sm">
                        <button
                          onClick={() => handleUpdateRole(user.id, !user.isAdmin)}
                          disabled={loading || user.id.toLowerCase() === currentUserWallet?.toLowerCase()}
                          className={`py-1 px-2 rounded text-xs font-bold transition duration-200
                                                ${user.isAdmin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                                                disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {user.isAdmin ? 'Revoke' : 'Grant'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}