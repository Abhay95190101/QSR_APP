import React, { useState } from 'react';
import { StaffUser, StaffRole, StoreProfile } from '../../types';

interface StaffUserManagerProps {
  storeProfile: StoreProfile;
  staffUsers: StaffUser[];
  onUpdateStaffUsers: (users: StaffUser[]) => void;
  onShowToast: (msg: string) => void;
}

export const StaffUserManager: React.FC<StaffUserManagerProps> = ({
  storeProfile,
  staffUsers = [],
  onUpdateStaffUsers = () => {},
  onShowToast,
}) => {
  const safeUsers = Array.isArray(staffUsers) ? staffUsers : [];
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<StaffRole>('manager');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [assignedZone, setAssignedZone] = useState<string>('All Zones');
  const [showPinId, setShowPinId] = useState<string | null>(null);

  const zones = storeProfile?.diningZones && Array.isArray(storeProfile.diningZones) && storeProfile.diningZones.length > 0
    ? ['All Zones', ...storeProfile.diningZones, 'Kitchen & Grill']
    : ['All Zones', 'Main Dining Room', 'Patio Garden', 'Rooftop Lounge', 'Kitchen & Grill'];

  const resetForm = () => {
    setName('');
    setRole('manager');
    setEmail('');
    setPhone('');
    setPin('');
    setAssignedZone('All Zones');
    setEditingUser(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setPin(user.pin);
    setAssignedZone(user.assignedZone || 'All Zones');
    setIsAddModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Staff name is required');
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      onShowToast('Please provide a 4-digit PIN for staff access');
      return;
    }

    if (editingUser) {
      // Update existing
      const updatedList = safeUsers.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: name.trim(),
            role,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            pin: pin.trim(),
            assignedZone,
          };
        }
        return u;
      });
      onUpdateStaffUsers(updatedList);
      onShowToast(`Updated details for ${name} (${role.toUpperCase()})`);
    } else {
      // Add new
      const newUser: StaffUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        role,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        pin: pin.trim(),
        assignedZone,
        isActive: true,
        createdAt: new Date().toISOString().slice(0, 10),
        lastActive: 'New staff',
      };
      onUpdateStaffUsers([...safeUsers, newUser]);
      onShowToast(`Assigned ${name} as ${role.toUpperCase()}!`);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  // Direct role assignment from list (Owner assigns manager)
  const handleQuickRoleChange = (userId: string, newRole: StaffRole) => {
    const updated = safeUsers.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    onUpdateStaffUsers(updated);
    const target = safeUsers.find((u) => u.id === userId);
    onShowToast(`Role updated: ${target?.name} is now assigned as ${newRole.toUpperCase()}`);
  };

  const handleToggleActive = (userId: string) => {
    const user = safeUsers.find((u) => u.id === userId);
    if (user?.role === 'owner') {
      onShowToast('Cannot deactivate the Primary Owner account');
      return;
    }
    const updated = safeUsers.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u));
    onUpdateStaffUsers(updated);
    onShowToast(`User status updated`);
  };

  const handleDeleteUser = (userId: string) => {
    const user = safeUsers.find((u) => u.id === userId);
    if (user?.role === 'owner') {
      onShowToast('Cannot delete the Primary Owner account');
      return;
    }
    if (confirm(`Remove staff member ${user?.name}?`)) {
      onUpdateStaffUsers(safeUsers.filter((u) => u.id !== userId));
      onShowToast(`Removed ${user?.name} from team`);
    }
  };

  const managersCount = safeUsers.filter((u) => u.role === 'manager').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">badge</span>
            </div>
            <h3 className="font-headline-md text-base sm:text-lg font-black text-on-surface">
              Staff &amp; Manager Assignments
            </h3>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            As the Owner, you can add team members, assign Managers to run daily shifts, and set 4-digit POS PINs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>Assign New Manager / Staff</span>
        </button>
      </div>

      {/* Role Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-surface-container/60 border border-black/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center font-black">
            👑
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Owner</span>
            <span className="font-headline-md text-sm font-black text-on-surface">Master Access</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface-container/60 border border-black/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black">
            👔
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Assigned Managers</span>
            <span className="font-headline-md text-sm font-black text-blue-700">{managersCount} Active</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface-container/60 border border-black/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black">
            🍳
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Kitchen Staff</span>
            <span className="font-headline-md text-sm font-black text-on-surface">
              {safeUsers.filter((u) => u.role === 'kitchen').length} Chefs
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface-container/60 border border-black/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black">
            🧾
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Floor &amp; Cashier</span>
            <span className="font-headline-md text-sm font-black text-on-surface">
              {safeUsers.filter((u) => u.role === 'waiter' || u.role === 'cashier').length} Staff
            </span>
          </div>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-black/[0.04] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex items-center justify-between">
          <h4 className="font-headline-md text-sm font-black text-on-surface">
            Team Members ({safeUsers.length})
          </h4>
          <span className="text-[11px] text-on-surface-variant">
            Use the dropdown in the &ldquo;Assigned Role&rdquo; column to reassign roles anytime
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container/50 text-[10px] font-black uppercase text-on-surface-variant border-b border-black/[0.04]">
              <tr>
                <th className="py-2.5 px-4">Staff Member</th>
                <th className="py-2.5 px-3">Assigned Role (Owner Controls)</th>
                <th className="py-2.5 px-3">Zone / Station</th>
                <th className="py-2.5 px-3">Access PIN</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {safeUsers.map((user) => {
                const isOwner = user.role === 'owner';
                const isManager = user.role === 'manager';

                return (
                  <tr key={user.id} className="hover:bg-surface-container/30 transition-colors">
                    {/* Name & Contact */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            isOwner
                              ? 'bg-purple-100 text-purple-800'
                              : isManager
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'kitchen'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-on-surface block">{user.name}</span>
                          <span className="text-[10px] text-on-surface-variant block">
                            {user.phone || user.email || 'No contact specified'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Role Selector */}
                    <td className="py-3 px-3">
                      {isOwner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                          👑 Owner (Full Admin)
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleQuickRoleChange(user.id, e.target.value as StaffRole)}
                          className={`px-2 py-1 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                            user.role === 'manager'
                              ? 'bg-blue-50 text-blue-800 border-blue-200 font-black'
                              : user.role === 'kitchen'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-surface-container text-on-surface border-black/5'
                          }`}
                        >
                          <option value="manager">👔 Manager</option>
                          <option value="kitchen">🍳 Kitchen Chef</option>
                          <option value="cashier">🧾 Cashier / POS</option>
                          <option value="waiter">🍽️ Floor Waiter</option>
                        </select>
                      )}
                    </td>

                    {/* Zone */}
                    <td className="py-3 px-3 text-on-surface font-medium">
                      {user.assignedZone || 'All Zones'}
                    </td>

                    {/* Access PIN */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span>{showPinId === user.id ? user.pin : '••••'}</span>
                        <button
                          type="button"
                          onClick={() => setShowPinId(showPinId === user.id ? null : user.id)}
                          className="text-[10px] text-on-surface-variant hover:text-on-surface"
                          title="Show/Hide PIN"
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {showPinId === user.id ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user.id)}
                        disabled={isOwner}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        } ${isOwner ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {user.isActive ? 'Active' : 'Suspended'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isOwner && user.role !== 'manager' && (
                          <button
                            type="button"
                            onClick={() => handleQuickRoleChange(user.id, 'manager')}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-1 border border-blue-200 transition-all shadow-2xs active:scale-95"
                            title="Promote to Manager"
                          >
                            <span>👔</span>
                            <span>Assign Manager</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                          title="Edit Staff Member"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>

                        {!isOwner && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors"
                            title="Remove Staff"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Reference Card */}
      <div className="bg-surface-container/40 p-4 rounded-2xl border border-black/5 text-xs space-y-2">
        <h5 className="font-headline-md text-xs font-black uppercase text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-blue-700">info</span>
          Role Permissions &amp; Responsibilities Guide
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-on-surface-variant">
          <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-black/5">
            <strong className="text-blue-800 block mb-1">👔 Manager Permissions:</strong>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Manage incoming table orders and Kitchen Display grill stages.</li>
              <li>Toggle out-of-stock menu items and dish availability in real time.</li>
              <li>Apply discounts, modify bills, print customer receipts, and settle UPI/Cash.</li>
              <li>Restricted from deleting the store, changing banking/tax details, or modifying Owner PIN.</li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-black/5">
            <strong className="text-purple-800 block mb-1">👑 Owner Permissions:</strong>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Full Master Control across all store operations, registers, and menus.</li>
              <li>Assign and revoke Manager privileges, staff PINs, and zones.</li>
              <li>Access financial accounting reports, CSV sales exports, and tax filings.</li>
              <li>Perform Manual Day End settlements and configure UPI merchant details.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto border border-black/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">person_add</span>
                <h3 className="font-headline-md text-base font-black text-on-surface">
                  {editingUser ? 'Edit Staff Member' : 'Assign Manager or Staff Member'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1 font-bold">
                  Staff Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amitabh Verma"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold outline-none border border-black/5"
                />
              </div>

              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1 font-bold">
                  Assign Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold outline-none border border-black/5"
                >
                  <option value="manager">👔 Manager (Shift Operations &amp; Billing)</option>
                  <option value="kitchen">🍳 Kitchen Chef (Grill &amp; Ticket Stages)</option>
                  <option value="cashier">🧾 Cashier / POS (Billing &amp; Settlement)</option>
                  <option value="waiter">🍽️ Floor Waiter (Order Taking &amp; Service)</option>
                  <option value="owner">👑 Co-Owner (Master Administrative Access)</option>
                </select>
                <p className="text-[10px] text-blue-700 font-semibold mt-1">
                  {role === 'manager'
                    ? 'Managers have full floor authority to settle bills, manage orders, and toggle items.'
                    : role === 'kitchen'
                    ? 'Kitchen staff can only see active orders and mark cooking/served.'
                    : 'Staff will have limited role-specific access.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-1 font-bold">
                    Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-1 font-bold">
                    4-Digit Access PIN *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="e.g. 4321"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-mono font-bold outline-none border border-black/5"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1 font-bold">
                  Assigned Dining Zone / Floor
                </label>
                <select
                  value={assignedZone}
                  onChange={(e) => setAssignedZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                >
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@sizzleandbun.in"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                />
              </div>

              <div className="pt-3 border-t border-black/[0.06] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  {editingUser ? 'Save Changes' : 'Assign & Activate Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
