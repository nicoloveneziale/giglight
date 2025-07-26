
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          GigLight - Discover Local Gigs
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {/* These links will go to your custom login/signup pages */}
          <Link href="/login" className="mr-4 px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Sign In
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-md text-blue-600 border border-blue-600 hover:bg-blue-50">
            Sign Up
          </Link>
        </div>
      </div>

      <h1 className="text-4xl font-bold mt-10">Welcome to GigLight!</h1>
      <p className="text-lg mt-4">Your hub for local music.</p>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">

      </div>
    </main>
  );
}