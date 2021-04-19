/**
 * Interface to describe the contents of a user's doc in Firestore
 */
interface User {
  email: string;
  name: string;
  admin: boolean;
  userId: string;
}

/**
 * Interface for ToggleUserPopover used for type safety
 * - `user` - the user to toggle admin status for
 * - `isLastAdmin` - if the signed in admin user is the last admin
 * - `setError` - setter for error state in the manage users page
 */
interface ToggleUserPopoverProps {
  user: User;
  isLastAdmin: boolean;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export type {User, ToggleUserPopoverProps};
