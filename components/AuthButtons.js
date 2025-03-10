"use client"; // This component will be client-side

import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@nextui-org/react"; // Import the Button component

const AuthButtons = ({ userId }) => {
  return (
    <>
      {userId ? (
        <Button
          as="a"
          href="/generate"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 text-center"
        >
          Unlock Your Creativity
        </Button>
      ) : (
        <SignInButton mode="modal">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 text-center"
          >
            Dive In and Create
          </Button>
        </SignInButton>
      )}
    </>
  );
};

export default AuthButtons; 