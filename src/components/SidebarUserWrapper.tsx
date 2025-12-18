// components/SidebarUserWrapper.tsx
'use client'

import { useEffect, useState } from 'react'
import { SidebarUser } from './SidebarUser'

export default function SidebarUserWrapper({ isCollapsed, onToggle }: { isCollapsed?: boolean; onToggle?: () => void }) {
  const [roleId, setRoleId] = useState<number | null>(null)

  useEffect(() => {
    const storedRole = localStorage.getItem('role_id')
    if (storedRole) {
      setRoleId(parseInt(storedRole, 10))
    }
  }, [])

  if (roleId === null) {
    return <div>Loading sidebar...</div>
  }

  return <SidebarUser roleId={roleId} isCollapsed={isCollapsed} onToggle={onToggle} />
}
