import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-900">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex max-w-[960px] flex-1 flex-col">

            {/* Main Content */}
            <main className="flex flex-grow flex-col items-center justify-center px-4 py-20 text-center">
              {/* Logo and Title */}
              <div className="flex flex-col items-center gap-6 mb-12">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900 p-4 rounded-2xl shadow-lg">
                    <span className="material-symbols-outlined text-5xl text-white">
                      verified
                    </span>
                  </div>
                </div>
                <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-6xl">
                  ExamFlow
                </h1>
                <div className="h-1 w-24 bg-blue-900 rounded-full"></div>
              </div>

              {/* Tagline */}
              <div className="flex flex-col items-center gap-4 text-center mb-16">
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-800 dark:text-slate-100 md:text-4xl">
                  Blockchain-Secured Examination System
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  Ensuring tamper-proof and instantly verifiable academic
                  credentials through blockchain technology.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full max-w-[520px] flex-col items-stretch gap-4 px-4">
                <Link
                  href="/registration"
                  className="group relative overflow-hidden rounded-xl bg-blue-900 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">person_add</span>
                    Register as Candidate
                  </span>
                </Link>

                <Link
                  href="/exam-center-verification"
                  className="group relative overflow-hidden rounded-xl bg-blue-900 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">verified</span>
                    Verify Admit Card
                  </span>
                </Link>

                <Link
                  href="/omr-processing"
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 border-2 border-blue-900 dark:border-blue-400 px-8 py-4 text-lg font-bold text-blue-900 dark:text-blue-400 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-blue-50 dark:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">lock</span>
                    Secure Exam Results
                  </span>
                </Link>

                <Link
                  href="/result-generation"
                  className="group relative overflow-hidden rounded-xl bg-green-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">assessment</span>
                    View Results
                  </span>
                </Link>

                <Link
                  href="/admin/answer-key"
                  className="group relative overflow-hidden rounded-xl bg-slate-900 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] border-2 border-slate-700"
                >
                  <div className="absolute inset-0 bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    Admin: Create Answer Key
                  </span>
                </Link>
              </div>

              {/* Badge */}
              <div className="mt-16 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/30 px-6 py-3 text-sm font-semibold text-blue-900 dark:text-blue-300 shadow-sm">
                <span className="material-symbols-outlined text-lg">shield</span>
                Powered by Blockchain Technology
              </div>
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