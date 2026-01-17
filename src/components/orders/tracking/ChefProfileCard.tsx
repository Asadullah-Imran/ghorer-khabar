interface User {
  name: string | null;
  avatar: string | null;
}

interface Kitchen {
  id: string;
  name: string;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  seller: User;
}

interface ChefProfileCardProps {
  chef: User;
  kitchen: Kitchen;
}

export default function ChefProfileCard({ chef, kitchen }: ChefProfileCardProps) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
      <h3 className="font-bold text-lg text-text-main dark:text-white mb-4">Your Home Chef</h3>
      
      <div className="flex items-center gap-4 mb-6">
        {/* Chef Avatar */}
        <div className="relative">
          <div 
            className="size-16 rounded-full bg-gray-200 bg-cover bg-center border-2 border-primary"
            style={chef.avatar ? { backgroundImage: `url("${chef.avatar}")` } : {}}
          >
            {!chef.avatar && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
            )}
          </div>
          
          {/* Verified Badge */}
          {kitchen.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">verified</span>
              Verified
            </div>
          )}
        </div>

        {/* Chef Info */}
        <div>
          <h4 className="font-bold text-brand-teal dark:text-primary text-lg">
            {chef.name || 'Chef'}
          </h4>
          <div className="flex items-center gap-1 text-sm text-text-secondary dark:text-gray-400 mb-1">
            <span className="material-symbols-outlined text-primary text-[16px] fill-current">star</span>
            <span className="font-semibold text-text-main dark:text-white">
              {kitchen.rating?.toFixed(1) || '0.0'}
            </span>
            <span>({kitchen.reviewCount} Reviews)</span>
          </div>
          {kitchen.isVerified && (
            <p className="text-xs text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded inline-block">
              Hygiene Checked
            </p>
          )}
        </div>
      </div>

      {/* Contact Button - Will be added separately as client component */}
      <div id="contact-chef-button-slot" />
    </div>
  );
}
