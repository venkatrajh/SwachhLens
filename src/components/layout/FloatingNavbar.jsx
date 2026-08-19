import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  User,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

export const FloatingNavbar = () => {
  const { isNavbarCollapsed, toggleNavbar, searchQuery, setSearchQuery } = useApp();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const profileMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/complaints?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  const getUserInitials = (name) => {
    if (!name) return 'KR';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = user?.name || 'Dr. K. Ramanathan, IAS';
  const displayRole = user?.role || 'Zonal Commissioner';
  const displayZone = 'Zone 5';
  const initials = getUserInitials(displayName);

  return (
    <header
      style={{
        padding: '14px 18px 6px 18px',
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 50,
        position: 'relative'
      }}
    >
      {/* CONTINUOUS PIECE OF PREMIUM LIQUID GLASS (overflow visible so dropdowns aren't clipped) */}
      <div
        className="floating-liquid-glass-navbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isNavbarCollapsed ? '6px 16px' : '10px 22px',
          minHeight: isNavbarCollapsed ? '46px' : '60px',
          backgroundColor: 'var(--glass-navbar)',
          backdropFilter: 'var(--liquid-glass-lg)',
          WebkitBackdropFilter: 'var(--liquid-glass-lg)',
          border: '1px solid var(--glass-border-light)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-floating)',
          transition: 'all var(--transition-normal), var(--transition-theme)',
          gap: '16px',
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* Specular Cyan Refraction Edge Highlight on Top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'var(--glass-specular-edge)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            pointerEvents: 'none'
          }}
        />

        {/* LEFT: SWACHHLENS Brand Pill */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <div
            style={{
              width: isNavbarCollapsed ? '28px' : '36px',
              height: isNavbarCollapsed ? '28px' : '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan-subtle)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px var(--accent-cyan-glow), inset 0 1px 0 var(--glass-highlight)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Shield size={isNavbarCollapsed ? 15 : 19} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: isNavbarCollapsed ? '13px' : '15px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)'
                }}
              >
                SWACHHLENS
              </span>
            </div>
            {!isNavbarCollapsed && (
              <span
                style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  marginTop: '1px'
                }}
              >
                Municipal Intelligence Platform
              </span>
            )}
          </div>
        </div>

        {/* CENTER: Liquid Glass Search Bar */}
        {!isNavbarCollapsed ? (
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: '480px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '14px',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search complaints, incident IDs, locations (e.g. Velachery, SWL1023)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                fontSize: '13px',
                backgroundColor: 'var(--surface-secondary)',
                backdropFilter: 'var(--liquid-glass-sm)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                transition: 'all var(--transition-fast)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-primary)';
                e.target.style.backgroundColor = 'var(--surface-hover)';
                e.target.style.boxShadow = '0 0 14px var(--accent-cyan-glow), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--glass-border)';
                e.target.style.backgroundColor = 'var(--surface-secondary)';
                e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.1)';
              }}
            />
          </form>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {/* RIGHT: Theme Switch, Notifications, Profile, Collapse Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isNavbarCollapsed ? '8px' : '10px', flexShrink: 0 }}>
          {/* THEME TOGGLE SWITCH */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Daylight Rose Light Mode" : "Switch to Midnight Purple Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              width: isNavbarCollapsed ? '32px' : '36px',
              height: isNavbarCollapsed ? '32px' : '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-secondary)',
              backdropFilter: 'var(--liquid-glass-sm)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#FBBF24' : 'var(--accent-primary)',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 var(--glass-highlight)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              e.currentTarget.style.boxShadow = '0 0 14px var(--accent-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 var(--glass-highlight)';
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Glass Notification Button */}
          <div style={{ position: 'relative' }} ref={notificationsMenuRef}>
            <button
              onClick={() => {
                setShowNotifications(prev => !prev);
                setShowProfileMenu(false);
              }}
              style={{
                position: 'relative',
                width: isNavbarCollapsed ? '32px' : '36px',
                height: isNavbarCollapsed ? '32px' : '36px',
                borderRadius: '50%',
                backgroundColor: showNotifications ? 'var(--surface-active)' : 'var(--surface-secondary)',
                backdropFilter: 'var(--liquid-glass-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: showNotifications ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'inset 0 1px 0 var(--glass-highlight)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!showNotifications) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: '7px',
                  right: '7px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--priority-critical)',
                  boxShadow: '0 0 6px var(--priority-critical)'
                }}
              />
            </button>

            {/* Level 3 Floating Liquid Glass Notifications Dropdown */}
            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: isNavbarCollapsed ? '42px' : '50px',
                  width: '320px',
                  backgroundColor: 'var(--glass-modal)',
                  backdropFilter: 'var(--liquid-glass-xl)',
                  WebkitBackdropFilter: 'var(--liquid-glass-xl)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--glass-border-light)',
                  boxShadow: 'var(--shadow-xl), inset 0 1px 0 var(--glass-highlight)',
                  padding: '16px',
                  zIndex: 200,
                  animation: 'fadeIn 0.18s ease-out'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Alerts</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2 unread</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      padding: '10px',
                      backgroundColor: 'var(--priority-critical-bg)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--priority-critical-border)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--priority-critical)' }}>Critical Incident</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>5 mins ago</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', marginTop: '3px' }}>Hazardous waste detected at Guindy Block 4.</p>
                  </div>
                  <div
                    style={{
                      padding: '10px',
                      backgroundColor: 'var(--surface-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--glass-border-subtle)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--status-completed)' }}>Cleanup Verified</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>25 mins ago</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '3px' }}>Mylapore green waste cleared by Team Green 2.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AUTHORITY PROFILE PILL & DROPDOWN */}
          <div style={{ position: 'relative' }} ref={profileMenuRef}>
            <button
              onClick={() => {
                setShowProfileMenu(prev => !prev);
                setShowNotifications(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: isNavbarCollapsed ? '4px 6px' : '4px 12px 4px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: showProfileMenu ? 'var(--surface-active)' : 'var(--surface-secondary)',
                backdropFilter: 'var(--liquid-glass-sm)',
                border: showProfileMenu ? '1px solid var(--accent-border)' : '1px solid var(--glass-border)',
                boxShadow: showProfileMenu ? '0 0 14px var(--accent-cyan-glow)' : 'inset 0 1px 0 var(--glass-highlight)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (!showProfileMenu) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!showProfileMenu) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: '0 0 12px var(--accent-cyan-glow)'
                }}
              >
                {initials}
              </div>
              {!isNavbarCollapsed && (
                <>
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1, maxWidth: '130px' }} className="truncate">
                      {displayName}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {displayRole}
                    </span>
                  </div>
                  <ChevronDown
                    size={13}
                    style={{
                      color: 'var(--text-muted)',
                      marginLeft: '2px',
                      transform: showProfileMenu ? 'rotate(180deg)' : 'none',
                      transition: 'transform var(--transition-fast)'
                    }}
                  />
                </>
              )}
            </button>

            {/* LEVEL 3 FLOATING LIQUID GLASS PROFILE DROPDOWN */}
            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: isNavbarCollapsed ? '42px' : '50px',
                  width: '260px',
                  backgroundColor: 'var(--glass-modal)',
                  backdropFilter: 'var(--liquid-glass-xl)',
                  WebkitBackdropFilter: 'var(--liquid-glass-xl)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--glass-border-light)',
                  boxShadow: 'var(--shadow-xl), inset 0 1px 0 var(--glass-highlight)',
                  padding: '16px',
                  zIndex: 300,
                  animation: 'fadeIn 0.18s ease-out'
                }}
              >
                {/* Officer Information Section */}
                <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {displayRole}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {displayZone}
                  </div>
                </div>

                {/* Profile & Account Settings Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '10px' }}>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      alert('Officer profile details simulated.');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <User size={14} style={{ color: 'var(--text-muted)' }} />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      alert('Account settings simulated.');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Settings size={14} style={{ color: 'var(--text-muted)' }} />
                    Account Settings
                  </button>
                </div>

                {/* Sign Out Action Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 10px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--priority-critical)',
                    backgroundColor: 'transparent',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--priority-critical-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Vertical Glass Divider */}
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--glass-border)' }} />

          {/* NAVBAR COLLAPSE / EXPAND TOGGLE */}
          <button
            onClick={toggleNavbar}
            title={isNavbarCollapsed ? "Expand Top Navbar" : "Compress Top Navbar"}
            aria-label={isNavbarCollapsed ? "Expand Top Navbar" : "Compress Top Navbar"}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-secondary)',
              backdropFilter: 'var(--liquid-glass-sm)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              boxShadow: 'inset 0 1px 0 var(--glass-highlight)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
          >
            {isNavbarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
};
