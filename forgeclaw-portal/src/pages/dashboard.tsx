import { useState, useEffect } from 'react'
import Head from 'next/head'
import { 
  ChatBubbleLeftRightIcon, 
  FolderIcon, 
  CogIcon, 
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface AdvisorInstance {
  id: string
  name: string
  subdomain: string
  status: 'running' | 'stopped' | 'updating'
  lastActivity: string
  skillsEnabled: string[]
  storageUsed: number
  storageLimit: number
  monthlyUsage: {
    tokens: number
    cost: number
  }
}

// Mock data - this will come from Northflank API
const mockInstance: AdvisorInstance = {
  id: 'adv-123',
  name: 'Smith Financial Advisors',
  subdomain: 'smithfinancial',
  status: 'running',
  lastActivity: '2 minutes ago',
  skillsEnabled: ['portfolio-analysis', 'risk-assessment', 'market-data', 'tax-planning'],
  storageUsed: 2.3,
  storageLimit: 10,
  monthlyUsage: {
    tokens: 45230,
    cost: 23.45
  }
}

const availableSkills = [
  { id: 'portfolio-analysis', name: 'Portfolio Analysis', category: 'Core', enabled: true, cost: 0 },
  { id: 'risk-assessment', name: 'Risk Assessment', category: 'Core', enabled: true, cost: 0 },
  { id: 'market-data', name: 'Market Data Pro', category: 'Core', enabled: true, cost: 0 },
  { id: 'compliance', name: 'Compliance Tools', category: 'Core', enabled: false, cost: 0 },
  { id: 'tax-planning', name: 'Advanced Tax Planning', category: 'Professional', enabled: true, cost: 29 },
  { id: 'esg-screening', name: 'ESG Screening', category: 'Enterprise', enabled: false, cost: 49 },
  { id: 'crypto-analysis', name: 'Crypto Analysis Suite', category: 'Add-on', enabled: false, cost: 29 }
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [instance, setInstance] = useState<AdvisorInstance>(mockInstance)
  const [isLoading, setIsLoading] = useState(false)

  const handleSkillToggle = async (skillId: string, enabled: boolean) => {
    setIsLoading(true)
    // This will call Northflank API to update instance configuration
    console.log(`${enabled ? 'Enabling' : 'Disabling'} skill:`, skillId)
    setIsLoading(false)
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'chat', name: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
    { id: 'files', name: 'File Manager', icon: FolderIcon },
    { id: 'skills', name: 'Skills', icon: BoltIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ]

  return (
    <>
      <Head>
        <title>Dashboard - {instance.name}</title>
      </Head>

      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">{instance.name}</h1>
                <p className="text-gray-400">
                  {instance.subdomain}.forgeclaw.com • 
                  <span className="inline-flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      instance.status === 'running' ? 'bg-green-400' :
                      instance.status === 'updating' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    {instance.status === 'running' ? 'Online' : 
                     instance.status === 'updating' ? 'Updating' : 'Offline'}
                  </span>
                </p>
              </div>
              
              <div className="flex gap-4">
                <a
                  href={`https://${instance.subdomain}.forgeclaw.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                >
                  Open AI Assistant
                </a>
                <button className="px-4 py-2 border border-slate-600 text-gray-300 rounded-md hover:bg-slate-700">
                  Instance Settings
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-slate-800 border-b border-slate-700">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Instance Status</p>
                      <p className="text-2xl font-bold text-white capitalize">{instance.status}</p>
                    </div>
                    <CheckCircleIcon className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Monthly Usage</p>
                      <p className="text-2xl font-bold text-white">${instance.monthlyUsage.cost}</p>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Storage Used</p>
                      <p className="text-2xl font-bold text-white">{instance.storageUsed}GB</p>
                      <p className="text-xs text-gray-500">of {instance.storageLimit}GB</p>
                    </div>
                    <FolderIcon className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Skills</p>
                      <p className="text-2xl font-bold text-white">{instance.skillsEnabled.length}</p>
                    </div>
                    <BoltIcon className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 text-left bg-slate-700 rounded-lg hover:bg-slate-600">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-400 mb-2" />
                    <div className="text-white font-medium">Start New Chat</div>
                    <div className="text-gray-400 text-sm">Begin conversation with your AI</div>
                  </button>
                  
                  <button className="p-4 text-left bg-slate-700 rounded-lg hover:bg-slate-600">
                    <FolderIcon className="h-6 w-6 text-purple-400 mb-2" />
                    <div className="text-white font-medium">Upload Files</div>
                    <div className="text-gray-400 text-sm">Add documents for analysis</div>
                  </button>
                  
                  <button className="p-4 text-left bg-slate-700 rounded-lg hover:bg-slate-600">
                    <ChartBarIcon className="h-6 w-6 text-green-400 mb-2" />
                    <div className="text-white font-medium">Generate Report</div>
                    <div className="text-gray-400 text-sm">Create client presentation</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Skills Marketplace</h3>
                
                <div className="space-y-4">
                  {availableSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          skill.enabled ? 'bg-green-400' : 'bg-gray-500'
                        }`} />
                        <div>
                          <div className="text-white font-medium">{skill.name}</div>
                          <div className="text-gray-400 text-sm">
                            {skill.category} • {skill.cost === 0 ? 'Included' : `$${skill.cost}/month`}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleSkillToggle(skill.id, !skill.enabled)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md font-medium ${
                          skill.enabled
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        } disabled:opacity-50`}
                      >
                        {skill.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab - Embedded OpenClaw WebChat */}
          {activeTab === 'chat' && (
            <div className="bg-slate-800 rounded-lg" style={{ height: '70vh' }}>
              <iframe
                src={`https://${instance.subdomain}.forgeclaw.com/chat`}
                className="w-full h-full rounded-lg border-0"
                title="AI Assistant Chat"
              />
            </div>
          )}

          {/* File Manager Tab */}
          {activeTab === 'files' && (
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">File Manager</h3>
              <p className="text-gray-400 mb-4">Manage files in your AI assistant's workspace</p>
              
              {/* File browser component would go here */}
              <div className="bg-slate-700 p-8 rounded-lg text-center">
                <FolderIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">File manager integration coming soon</p>
                <p className="text-sm text-gray-500 mt-2">
                  Full access to your VPS file structure and document management
                </p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Instance Settings</h3>
                
                {/* Settings form would go here */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Instance Name
                    </label>
                    <input
                      type="text"
                      value={instance.name}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Custom Domain
                    </label>
                    <input
                      type="text"
                      value={`${instance.subdomain}.forgeclaw.com`}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
