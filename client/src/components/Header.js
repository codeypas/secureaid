import WalletConnection from "./WalletConnection"

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">SecureAid Fundraising</h1>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Blockchain Powered
            </span>
          </div>

          <nav className="flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Campaigns
            </a>
            <a href="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
              Admin
            </a>
            <WalletConnection />
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
