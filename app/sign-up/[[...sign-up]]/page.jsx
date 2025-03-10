import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  <div className="flex justify-center items-center min-h-screen bg-black">
    return{" "}
    <SignUp
      appearance={{
        elements: {
          formbuttonPrimary:
            "bg-blue-600 hover:bg-blue-800 text-sm normal-case",
        },
      }}
    />
  </div>;
}
