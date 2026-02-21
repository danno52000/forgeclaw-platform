import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ChevronRightIcon, StarIcon, BoltIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      <Head>
        <title>ForgeClaw - AI Assistants for Financial Advisors</title>
        <meta name="description" content="One-click OpenClaw deployment platform for Financial Advisors with pre-configured skills and compliance frameworks." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Header */}
        <header className="relative z-10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
            <div className="flex lg:flex-1">
              <div className="-m-1.5 p-1.5">
                <span className="text-2xl font-bold text-white">🦞 ForgeClaw</span>
              </div>
            </div>
            <div className="hidden lg:flex lg:gap-x-12">
              <a href="#features" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
                Features
              </a>
              <a href="#pricing" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
                Pricing
              </a>
              <a href="#skills" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
                Skills
              </a>
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-4">
              <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
                Log in <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link 
                href="/signup" 
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                AI Assistants for 
                <span className="text-blue-400"> Financial Advisors</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Get your own dedicated OpenClaw AI assistant with pre-configured financial advisor skills, 
                compliance frameworks, and secure infrastructure - deployed in minutes.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/signup"
                  className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
                >
                  Start Your Free Trial
                </Link>
                <Link href="#demo" className="text-lg font-semibold leading-6 text-white hover:text-blue-300">
                  Watch Demo <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Key Stats */}
            <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-3 lg:mx-0 lg:max-w-none">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">5min</div>
                <div className="text-sm text-gray-400">Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-gray-400">Availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">SOC2</div>
                <div className="text-sm text-gray-400">Compliant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Built for Financial Advisors
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <BoltIcon className="h-5 w-5 flex-none text-blue-400" />
                    Pre-Configured Skills
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">
                      Portfolio analysis, risk assessment, market research, client reporting, and more - 
                      all ready to use out of the box.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <ShieldCheckIcon className="h-5 w-5 flex-none text-blue-400" />
                    Compliance Ready
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">
                      Built-in SEC/FINRA compliance templates, data privacy controls, and 
                      audit-ready logging for peace of mind.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <ChartBarIcon className="h-5 w-5 flex-none text-blue-400" />
                    Your Own Instance
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">
                      Dedicated infrastructure, your API keys, your data - with custom domain 
                      and full control over your AI assistant.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Join forward-thinking advisors who are using AI to deliver better client outcomes.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
