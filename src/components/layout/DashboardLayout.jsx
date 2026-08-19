import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBackground } from './AppBackground';
import { FloatingNavbar } from './FloatingNavbar';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  return (
    <AppBackground>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden'
        }}
      >
        {/* Left Sidebar (Normal fixed panel, does not collapse with navbar) */}
        <Sidebar />

        {/* Right Application Area (Navbar + Main Content) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          {/* Floating Top Navbar (Occupies normal layout flow) */}
          <FloatingNavbar />

          {/* Main Scrollable Content */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px 32px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </AppBackground>
  );
};
