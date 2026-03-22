import { SignUp } from '@clerk/react';

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0a0a0f]">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-[#111118] border border-white/10',
          },
        }}
      />
    </div>
  );
}
