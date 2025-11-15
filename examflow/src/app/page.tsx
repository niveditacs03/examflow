import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-900">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex max-w-[960px] flex-1 flex-col">

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
                <Link
                  href="/registration"
                  className="flex h-12 min-w-[84px] max-w-[480px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#1e3b8a] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-[#1e3b8a]/90"
                >
                  <span className="truncate">Register as Candidate</span>
                </Link>
                <Link
                  href="/exam-center-verification"
                  className="flex h-12 min-w-[84px] max-w-[480px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#1e3b8a] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-[#1e3b8a]/90"
                >
                  <span className="truncate">Exam Center Verification</span>
                </Link>
                <Link
                  href="/omr-processing"
                  className="flex h-12 min-w-[84px] max-w-[480px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-[#1e3b8a] bg-transparent px-5 text-base font-bold leading-normal tracking-[0.015em] text-[#1e3b8a] hover:bg-[#1e3b8a]/10 dark:border-white dark:text-white"
                >
                  <span className="truncate">Secure Exam Results</span>
                </Link>
                <button className="flex h-12 min-w-[84px] max-w-[480px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#1e3b8a] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-[#1e3b8a]/90">
                  <span className="truncate">Results</span>
                </button>
              </div>
              <p className="text-sm font-normal leading-normal text-[#6B7280] dark:text-gray-400">
                Powered by blockchain technology
              </p>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 py-12 px-4">
              <div className="grid w-full max-w-4xl mx-auto grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                    <span className="material-symbols-outlined text-3xl text-slate-700 dark:text-slate-300">
                      lock
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    Immutable Records
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Data secured on blockchain
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                    <span className="material-symbols-outlined text-3xl text-slate-700 dark:text-slate-300">
                      check_circle
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    Independent Verification
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Anyone can verify results
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                    <span className="material-symbols-outlined text-3xl text-slate-700 dark:text-slate-300">
                      receipt_long
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    Transparent Audit Trail
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Complete history tracking
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