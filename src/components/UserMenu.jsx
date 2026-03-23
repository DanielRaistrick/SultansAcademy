import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './UserMenu.css';

const UserMenu = ({ user }) => {
  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="user-menu">
      {user.photoURL && (
        <img
          className="user-avatar"
          src={user.photoURL}
          alt={user.displayName ?? 'User'}
          referrerPolicy="no-referrer"
        />
      )}
      <span className="user-name">{user.displayName}</span>
      <button className="btn-sign-out" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
};

export default UserMenu;
