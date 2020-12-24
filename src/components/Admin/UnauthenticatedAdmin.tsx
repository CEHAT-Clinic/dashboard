import React, {useState} from 'react';
import SignIn from './Authentication/SignIn';
import SignUp from './Authentication/SignUp';

/**
 * Admin page when a user is not authenticated/signed in.
 */
const UnauthenticatedAdmin: () => JSX.Element = () => {
  const [isNewUser, setIsNewUser] = useState(false);
  return (
    <div>
      {isNewUser ? (
        <SignUp setIsNewUser={setIsNewUser} />
      ) : (
        <SignIn setIsNewUser={setIsNewUser} />
      )}
    </div>
  );
};

export default UnauthenticatedAdmin;
