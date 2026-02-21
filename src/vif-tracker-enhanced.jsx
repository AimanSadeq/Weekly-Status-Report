import React, { useState } from 'react';
import { Calendar, Users, CheckCircle, AlertCircle, FileText, LogOut, Plus, Filter, Download, ChevronRight, Mail, Lock, Building, Activity, TrendingUp, Clock, Bell } from 'lucide-react';

const VIFActivityTracker = () => {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [activities, setActivities] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [formData, setFormData] = useState({
    activityType: '',
    unitsCompleted: '',
    percentageComplete: '',
    description: '',
    bscCategory: ''
  });

  // Employee data with departments
  const employees = {
    'asadeq@viftraining.com': { name: 'Aiman', role: 'admin', departments: ['Management', 'Consultants'] },
    'omar@viftraining.com': { name: 'Omar', role: 'employee', departments: ['Website & Digital Marketing', 'Consultants'] },
    'ahmadg@viftraining.com': { name: 'Ahmad', role: 'employee', departments: ['Operations', 'Consultants'] },
    'akayed@viftraining.com': { name: 'Amal', role: 'employee', departments: ['Business Development & Relationship Management', 'Consultants'] },
    'ali@viftraining.com': { name: 'Ali', role: 'employee', departments: ['Consultants'] },
    'ammar@viftraining.com': { name: 'Ammar', role: 'employee', departments: ['Consultants'] },
    'ajubain@viftraining.com': { name: 'Alaa', role: 'employee', departments: ['Operations'] },
    'dalia@viftraining.com': { name: 'Dalia', role: 'employee', departments: ['Operations'] },
    'mohamad@viftraining.com': { name: 'MJ', role: 'employee', departments: ['Finance'] },
    'asaad@viftraining.com': { name: 'Asaad', role: 'employee', departments: ['Website & Digital Marketing'] },
    'ibrahim@viftraining.com': { name: 'Ibrahim', role: 'employee', departments: ['Consultants'] },
    'moayad@viftraining.com': { name: 'Moayad', role: 'employee', departments: ['Consultants'] },
    'mufid@viftraining.com': { name: 'Mufid', role: 'employee', departments: ['Consultants'] },
    'yassin@viftraining.com': { name: 'Yassin', role: 'employee', departments: ['Consultants'] },
    'wael@viftraining.com': { name: 'Wael', role: 'employee', departments: ['Consultants'] },
    'yousef@viftraining.com': { name: 'Yousef', role: 'employee', departments: ['Consultants'] },
    'rima@viftraining.com': { name: 'Rima', role: 'employee', departments: ['Operations'] }
  };

  // Activity types based on department
  const getActivityTypes = (dept) => {
    const consultantActivities = [
      'Consulting', 'Clinic', 'Training (Billing Days)', 'Coaching', 'ITP',
      'BSC - BDRM (Optional)', 'BSC - eLearning (Mandatory)', 
      'BSC - New Courses (Mandatory)', 'BSC - Certifications (Mandatory)'
    ];
    const generalActivities = [
      'Special Projects', 'Conference', 'Course Outline Support/Design',
      'Proposal Support', 'Vacation', 'Sick', 'Consultant Support',
      'Client Support', 'Course Materials Design/Audit', 'Personal Days Off'
    ];
    
    return dept === 'Consultants' 
      ? [...consultantActivities, ...generalActivities] 
      : generalActivities;
  };

  // Mock submitted activities for admin view
  const [allActivities, setAllActivities] = useState([
    { id: 1, employee: 'Omar', email: 'omar@viftraining.com', department: 'Consultants', activity: 'Training (Billing Days)', units: 8, percentage: 100, status: 'submitted', week: '2025-10-03', description: 'Conducted leadership training for new batch' },
    { id: 2, employee: 'Ahmad', email: 'ahmadg@viftraining.com', department: 'Operations', activity: 'Special Projects', units: 5, percentage: 60, status: 'submitted', week: '2025-10-03', description: 'Working on process optimization' },
    { id: 3, employee: 'Ali', email: 'ali@viftraining.com', department: 'Consultants', activity: 'Consulting', units: 12, percentage: 100, status: 'reviewed', week: '2025-10-03', description: 'Client consulting sessions completed', adminFeedback: 'Excellent work on the client project!' },
    { id: 4, employee: 'Dalia', email: 'dalia@viftraining.com', department: 'Operations', activity: 'Client Support', units: 6, percentage: 75, status: 'submitted', week: '2025-10-03', description: 'Handled customer inquiries and support tickets' },
    { id: 5, employee: 'Amal', email: 'akayed@viftraining.com', department: 'Business Development & Relationship Management', activity: 'Proposal Support', units: 3, percentage: 100, status: 'submitted', week: '2025-10-03', description: 'Prepared 3 client proposals' },
    { id: 6, employee: 'MJ', email: 'mohamad@viftraining.com', department: 'Finance', activity: 'Special Projects', units: 4, percentage: 50, status: 'draft', week: '2025-10-03', description: 'Financial analysis for Q4' }
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email.endsWith('@viftraining.com')) {
      const user = employees[email];
      if (user) {
        setCurrentUser({ email, ...user });
        setCurrentView(user.role === 'admin' ? 'admin' : 'dashboard');
        if (user.departments.length === 1) {
          setSelectedDepartment(user.departments[0]);
        }
        // Load user's activities if employee
        if (user.role === 'employee') {
          const userActivities = allActivities
            .filter(a => a.email === email)
            .map(a => ({
              ...a,
              status: a.status === 'draft' ? 'draft' : a.status
            }));
          setActivities(userActivities);
        }
      } else {
        alert('User not found in system. Please contact admin.');
      }
    } else {
      alert('Please use your @viftraining.com email address');
    }
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    const newActivity = {
      id: Date.now(),
      employee: currentUser.name,
      email: currentUser.email,
      department: selectedDepartment,
      activity: formData.activityType,
      units: parseInt(formData.unitsCompleted) || 0,
      percentage: parseInt(formData.percentageComplete) || 0,
      description: formData.description,
      bscCategory: formData.bscCategory,
      status: 'draft',
      week: '2025-10-03',
      date: new Date().toLocaleDateString()
    };
    
    setActivities([...activities, newActivity]);
    setAllActivities([...allActivities, newActivity]);
    setFormData({ 
      activityType: '', 
      unitsCompleted: '', 
      percentageComplete: '', 
      description: '',
      bscCategory: '' 
    });
    alert('Activity added successfully!');
  };

  const handleSubmitWeek = () => {
    const updatedActivities = activities.map(a => 
      a.status === 'draft' ? { ...a, status: 'submitted' } : a
    );
    setActivities(updatedActivities);
    
    const updatedAll = allActivities.map(a => {
      const updated = updatedActivities.find(ua => ua.id === a.id);
      return updated || a;
    });
    setAllActivities(updatedAll);
    
    alert('Weekly activities submitted successfully!');
  };

  const handleReview = (activity) => {
    setSelectedActivity(activity);
    setFeedback(activity.adminFeedback || '');
    setShowReviewModal(true);
  };

  const handleSaveReview = () => {
    const updatedActivities = allActivities.map(a => 
      a.id === selectedActivity.id 
        ? { ...a, status: 'reviewed', adminFeedback: feedback }
        : a
    );
    setAllActivities(updatedActivities);
    setShowReviewModal(false);
    setSelectedActivity(null);
    setFeedback('');
    alert('Review saved successfully!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setEmail('');
    setPassword('');
    setActivities([]);
    setSelectedDepartment('');
  };

  // Calculate statistics
  const stats = {
    totalEmployees: 17,
    submittedThisWeek: allActivities.filter(a => a.status === 'submitted' || a.status === 'reviewed').length,
    pendingReview: allActivities.filter(a => a.status === 'submitted').length,
    reviewed: allActivities.filter(a => a.status === 'reviewed').length
  };

  // Login View
  if (currentView === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
              <div className="text-center">
                <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Building className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">VIF Training</h2>
                <p className="text-indigo-100">Employee Activity Tracking System</p>
              </div>
            </div>
            
            <div className="px-8 py-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="your.name@viftraining.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Sign In
                </button>
              </form>
              
              <div className="mt-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-amber-800 mb-3 flex items-center">
                    <Bell className="w-4 h-4 mr-1" />
                    Demo Accounts Available:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-medium">Admin Access:</span>
                      <code className="bg-amber-100 px-2 py-1 rounded text-amber-800">asadeq@viftraining.com</code>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-medium">Employee Access:</span>
                      <code className="bg-amber-100 px-2 py-1 rounded text-amber-800">omar@viftraining.com</code>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 text-center">(Any password works for demo)</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Only @viftraining.com email addresses can access this system
          </p>
        </div>
      </div>
    );
  }

  // Employee Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Welcome back, {currentUser?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Week Ending: Thursday, Oct 3, 2025
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Entry Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Weekly Activity</h2>
                </div>
                
                <form onSubmit={handleAddActivity} className="space-y-4">
                  {currentUser?.departments.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      >
                        <option value="">Select Department</option>
                        {currentUser.departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                    <select
                      value={formData.activityType}
                      onChange={(e) => setFormData({...formData, activityType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      required
                      disabled={!selectedDepartment}
                    >
                      <option value="">Select Activity Type</option>
                      {selectedDepartment && getActivityTypes(selectedDepartment).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Units Completed</label>
                      <input
                        type="number"
                        value={formData.unitsCompleted}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setFormData({...formData, unitsCompleted: value});
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">% Complete</label>
                      <input
                        type="number"
                        value={formData.percentageComplete}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setFormData({...formData, percentageComplete: value});
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  {formData.activityType.includes('BSC') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">BSC Category</label>
                      <input
                        type="text"
                        value={formData.bscCategory}
                        onChange={(e) => setFormData({...formData, bscCategory: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Enter BSC category"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      rows="3"
                      placeholder="Describe your activity..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                    disabled={!selectedDepartment || !formData.activityType}
                  >
                    <Plus className="w-4 h-4" />
                    Add Activity
                  </button>
                </form>
              </div>
            </div>
            
            {/* This Week's Activities */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">This Week's Activities</h3>
                  {activities.filter(a => a.status === 'draft').length > 0 && (
                    <button 
                      onClick={handleSubmitWeek}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      Submit Week
                    </button>
                  )}
                </div>
                
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No activities added yet</p>
                    <p className="text-gray-400 text-xs mt-1">Add your first activity to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map(activity => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{activity.activity}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.department}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            activity.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                            activity.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-xs text-gray-600 mb-2">{activity.description}</p>
                        )}
                        <div className="flex gap-4 text-xs text-gray-500">
                          {activity.units > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {Math.floor(activity.units)} units
                            </span>
                          )}
                          {activity.percentage > 0 && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {Math.floor(activity.percentage)}%
                            </span>
                          )}
                        </div>
                        {activity.adminFeedback && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs font-medium text-blue-800 mb-1">Admin Feedback:</p>
                            <p className="text-xs text-blue-700">{activity.adminFeedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Admin Dashboard View
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Review and manage employee activities</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.submittedThisWeek}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingReview}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviewed</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.reviewed}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week Ending</label>
                <input
                  type="date"
                  defaultValue="2025-10-03"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>All Employees</option>
                  {Object.entries(employees).map(([email, emp]) => (
                    <option key={email}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>All Status</option>
                  <option>Draft</option>
                  <option>Submitted</option>
                  <option>Reviewed</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                  <Filter className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Activities Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {allActivities.map(activity => (
                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.employee}</div>
                        <div className="text-xs text-gray-500">{activity.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.activity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.units > 0 && `${Math.floor(activity.units)} units`}
                        {activity.units > 0 && activity.percentage > 0 && ' - '}
                        {activity.percentage > 0 && `${Math.floor(activity.percentage)}%`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activity.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                          activity.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                          activity.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleReview(activity)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Review Modal */}
        {showReviewModal && selectedActivity && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Activity</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedActivity.employee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Department:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedActivity.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Activity:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedActivity.activity}</span>
                </div>
                {selectedActivity.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedActivity.description}</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedActivity.units > 0 && `${Math.floor(selectedActivity.units)} units`}
                    {selectedActivity.units > 0 && selectedActivity.percentage > 0 && ' - '}
                    {selectedActivity.percentage > 0 && `${Math.floor(selectedActivity.percentage)}%`}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="4"
                  placeholder="Enter your feedback..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReview}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default VIFActivityTracker;
