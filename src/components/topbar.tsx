import Link from 'next/link';

const Topbar = () => {
  return (
    <nav className="w-full border-b bg-background fixed top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Left section */}
          <div className="flex items-center">
            
          </div>

          {/* Middle section */}
          <div className="flex items-center space-x-6 justify-center">
            <Link href="/" className="text-xl font-semibold">
              Please Forget Me
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
