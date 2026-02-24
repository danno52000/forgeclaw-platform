import { useRouter } from 'next/router'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { API_BASE_URL } from '../config/api'
import { ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline'

interface SkillPackage {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  popular?: boolean
}

const skillPackages: SkillPackage[] = [
  {
    id: 'core',
    name: 'Core FA Skills',
    description: 'Essential tools every advisor needs',
    price: 0,
    features: [
      'Portfolio Analysis',
      'Risk Assessment',
      'Market Research',
      'Basic Client Reporting',
      'Compliance Templates'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Package',
    description: 'Advanced features for growing practices',
    price: 49,
    popular: true,
    features: [
      'Everything in Core',
      'Advanced Tax Planning',
      'Estate Planning Tools', 
      'Performance Attribution',
      'Custom Report Builder',
      'CRM Integration'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Suite', 
    description: 'Complete solution for RIA firms',
    price: 149,
    features: [
      'Everything in Professional',
      'ESG Screening & Analysis',
      'Alternative Investment Tools',
      'Multi-Custodian Support',
      'White-Label Reports',
      'API Access',
      'Priority Support'
    ]
  }
]

export default function Signup() {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    
    // Step 2: Practice Info
    practiceType: '',
    aum: '',
    clientCount: '',
    primaryCustodian: '',
    
    // Step 3: Skills Selection
    selectedPackage: 'professional',
    additionalSkills: [] as string[],
    
    // Step 4: Instance Config
    subdomain: '',
    anthropicApiKey: '',
    dataRetention: '90'
  })

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Create advisor account
      const response = await fetch(`${API_BASE_URL}/api/advisors/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Basic info
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          
          // Practice info
          practiceType: formData.practiceType,
          aum: formData.aum,
          clientCount: formData.clientCount,
          primaryCustodian: formData.primaryCustodian,
          
          // Configuration
          subdomain: formData.subdomain,
          selectedPackage: formData.selectedPackage,
          additionalSkills: formData.additionalSkills,
          anthropicApiKey: formData.anthropicApiKey,
          dataRetention: formData.dataRetention
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create advisor instance')
      }

      const result = await response.json()
      
      // Redirect to dashboard or success page
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Error creating advisor instance:', error)
      setError(error instanceof Error ? error.message : 'Failed to create your instance. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - ForgeClaw</title>
        <meta name="description" content="Create your ForgeClaw advisor account" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Header */}
        <header className="relative z-10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
            <Link href="/" className="flex items-center gap-x-2 text-white hover:text-blue-300">
              <ChevronLeftIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <div className="text-2xl font-bold text-white">🦞 ForgeClaw</div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </nav>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span className={currentStep >= 1 ? 'text-blue-400' : ''}>Basic Info</span>
              <span className={currentStep >= 2 ? 'text-blue-400' : ''}>Practice Details</span>
              <span className={currentStep >= 3 ? 'text-blue-400' : ''}>Skills Selection</span>
              <span className={currentStep >= 4 ? 'text-blue-400' : ''}>Configuration</span>
            </div>
            <div className="mt-2 h-2 bg-gray-700 rounded-full">
              <div 
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Let's get you started</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company/Firm Name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Skills Selection */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Choose Your Skills Package</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {skillPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative p-6 bg-slate-700 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.selectedPackage === pkg.id
                          ? 'border-blue-500 bg-slate-600'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => handleInputChange('selectedPackage', pkg.id)}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{pkg.description}</p>
                        <div className="mt-4">
                          <span className="text-2xl font-bold text-white">
                            ${pkg.price}
                          </span>
                          <span className="text-gray-400">/month</span>
                        </div>
                      </div>
                      
                      <ul className="space-y-2">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-x-2 text-sm text-gray-300">
                            <CheckIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-slate-600 text-gray-300 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  { isLoading ? 'Creating Instance...' : 'Create My Instance' }
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
