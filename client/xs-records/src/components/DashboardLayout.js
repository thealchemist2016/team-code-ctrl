import React, { Component } from 'react';
import Sidebar from './Sidebar';

class DashboardLayout extends Component {
  render() {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default DashboardLayout;
