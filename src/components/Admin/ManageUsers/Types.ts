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
 */
interface ToggleUserPopoverProps {
  user: User;
  isLastAdmin: boolean;
}

export type {User, ToggleUserPopoverProps};
