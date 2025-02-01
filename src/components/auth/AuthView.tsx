'use client';

import { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

export default function AuthView() {
  const [isSignIn, setIsSignIn] = useState(true);

  const toggleView = () => {
    setIsSignIn(!isSignIn);
  };

  return isSignIn ? (
    <SignIn onToggleView={toggleView} />
  ) : (
    <SignUp onToggleView={toggleView} />
  );
} 