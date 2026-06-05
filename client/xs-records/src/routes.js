import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Dashboard from './components/dashboard';
import Register from './components/register';
import Login from './components/login-form';
import Home from './components/home';
import AddAlbum from './components/add-album';
import AddTrack from './components/add-track';
import Profile from './components/Profile';
import ReleaseList from './components/ReleaseList';
import Balance from './components/Balance';
import Notifications from './components/Notifications';
import ContactUs from './components/ContactUs';
import AboutUs from './components/AboutUs';
import Blogs from './components/Blogs';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default () =>
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/login" exact component={Login} />
    <Route path="/register" exact component={Register} />
    <Route path="/about" exact component={AboutUs} />
    <Route path="/blogs" exact component={Blogs} />
    <ProtectedRoute path="/dashboard" exact component={Dashboard} />
    <ProtectedRoute path="/profile" exact component={Profile} />
    <ProtectedRoute path="/add-album" exact component={AddAlbum} />
    <ProtectedRoute path="/add-track" exact component={AddTrack} />
    <ProtectedRoute path="/releases/incomplete" exact render={(props) => <ReleaseList {...props} status="incomplete" />} />
    <ProtectedRoute path="/releases/pending" exact render={(props) => <ReleaseList {...props} status="pending" />} />
    <ProtectedRoute path="/releases/rejected" exact render={(props) => <ReleaseList {...props} status="rejected" />} />
    <ProtectedRoute path="/releases/approved" exact render={(props) => <ReleaseList {...props} status="approved" />} />
    <ProtectedRoute path="/releases" exact render={(props) => <ReleaseList {...props} />} />
    <ProtectedRoute path="/balance" exact component={Balance} />
    <ProtectedRoute path="/notifications" exact component={Notifications} />
    <ProtectedRoute path="/contact" exact component={ContactUs} />
    <ProtectedRoute path="/admin" exact component={AdminDashboard} />
  </Switch>;
