import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-[#121620]">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex max-w-[960px] flex-1 flex-col">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap px-10 py-3">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-2xl text-[#1e3b8a]">
                  verified
                </span>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-[#1e3b8a] dark:text-white">
                  ExamFlow
                </h2>
              </div>
              <div className="flex flex-1 justify-end gap-8">
                <div className="flex items-center gap-9">
                  <Link
                    href="#"
                    className="text-sm font-medium leading-normal text-[#6B7280] dark:text-gray-300"
                  >
                    About
                  </Link>
                </div>
                <button className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#1e3b8a] px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white hover:bg-[#1e3b8a]/90">
                  <span className="truncate">Verify Result</span>
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-grow flex-col items-center justify-center px-4 py-16 text-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#1e3b8a] dark:text-white md:text-5xl">
                  Blockchain-Secured Examination System
                </h1>
                <h2 className="max-w-2xl text-base font-normal leading-normal text-[#6B7280] dark:text-gray-300 md:text-lg">
                  Ensuring tamper-proof and instantly verifiable academic
                  credentials through blockchain technology.
                </h2>
              </div>
              <div className="flex w-full max-w-[480px] flex-1 flex-col items-stretch gap-3 px-4 py-8">
                <button className="flex h-12 min-w-[84px] max-w-[480px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#1e3b8a] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-[#1e3b8a]/90">
                  <span className="truncate">Register as Exam Authority</span>
                </button>
                <Link
                  href="/registration"
                  className="flex h-12 min-w-[84px] max-w-[480px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#1e3b8a] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-[#1e3b8a]/90"
                >
                  <span className="truncate">Register as Candidate</span>
                </Link>
                <button className="flex h-12 min-w-[84px] max-w-[480px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-[#1e3b8a] bg-transparent px-5 text-base font-bold leading-normal tracking-[0.015em] text-[#1e3b8a] hover:bg-[#1e3b8a]/10 dark:border-white dark:text-white">
                  <span className="truncate">Verify Exam Results</span>
                </button>
              </div>
              <p className="text-sm font-normal leading-normal text-[#6B7280] dark:text-gray-400">
                Powered by blockchain technology
              </p>
            </main>

            {/* Footer */}
            <footer className="mt-auto flex justify-center px-4 py-10">
              <div className="grid w-full max-w-4xl grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
                <div className="flex flex-col items-center gap-2 md:items-start">
                  <span className="material-symbols-outlined text-2xl text-[#6B7280] dark:text-gray-400">
                    lock
                  </span>
                  <p className="text-sm font-medium leading-normal text-[#6B7280] dark:text-gray-300">
                    Immutable records
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 md:items-start">
                  <span className="material-symbols-outlined text-2xl text-[#6B7280] dark:text-gray-400">
                    check_circle
                  </span>
                  <p className="text-sm font-medium leading-normal text-[#6B7280] dark:text-gray-300">
                    Independent verification
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 md:items-start">
                  <span className="material-symbols-outlined text-2xl text-[#6B7280] dark:text-gray-400">
                    receipt_long
                  </span>
                  <p className="text-sm font-medium leading-normal text-[#6B7280] dark:text-gray-300">
                    Transparent audit trail
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}