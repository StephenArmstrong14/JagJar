import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface BrowserExtensionDownloadProps {
  browser: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
}

export function BrowserExtensionDownload({ 
  browser, 
  variant = "default", 
  size = "default",
  className = "",
  showIcon = true
}: BrowserExtensionDownloadProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Custom browser-specific installation instructions
  const getInstructions = () => {
    switch(browser.toLowerCase()) {
      case 'firefox':
        return {
          title: "Firefox Add-on Installation",
          steps: [
            "Navigate to the JagJar Firefox Add-on page",
            "Click 'Add to Firefox'",
            "Review the permissions and click 'Add'",
            "The JagJar icon will appear in your toolbar"
          ],
          downloadUrl: "https://addons.mozilla.org/en-US/firefox/addon/jagjar-time-tracker/",
          storeText: "Firefox Add-ons Store",
          downloadText: "Download for Firefox"
        };
      case 'safari':
        return {
          title: "Safari Extension Installation",
          steps: [
            "Download the JagJar Safari Extension",
            "Open Safari and go to Safari > Preferences > Extensions",
            "Drag the downloaded .safariextz file onto the Extensions window",
            "Click 'Install' when prompted"
          ],
          downloadUrl: "https://apps.apple.com/app/jagjar-time-tracker/id1234567890",
          storeText: "Mac App Store",
          downloadText: "Download for Safari"
        };
      case 'edge':
        return {
          title: "Microsoft Edge Add-on Installation",
          steps: [
            "Navigate to the JagJar Edge Add-on page",
            "Click 'Get' and then 'Add extension'",
            "The JagJar icon will appear in your toolbar"
          ],
          downloadUrl: "https://microsoftedge.microsoft.com/addons/detail/jagjar-time-tracker/abcdefghijklmn",
          storeText: "Microsoft Edge Add-ons",
          downloadText: "Download for Edge"
        };
      case 'chrome':
      default:
        return {
          title: "Chrome Extension Installation",
          steps: [
            "Navigate to the JagJar Chrome Web Store page",
            "Click 'Add to Chrome'",
            "Review the permissions and click 'Add extension'",
            "The JagJar icon will appear in your toolbar"
          ],
          downloadUrl: "https://chrome.google.com/webstore/detail/jagjar-time-tracker/abcdefghijklmn",
          storeText: "Chrome Web Store",
          downloadText: "Download for Chrome"
        };
    }
  };

  const instructions = getInstructions();
  
  const browserIcons = {
    chrome: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4"></circle>
        <line x1="21.17" y1="8" x2="12" y2="8"></line>
        <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
        <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
      </svg>
    ),
    firefox: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
        <path d="M17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12Z"></path>
        <path d="M12 7V2"></path>
        <path d="M20 12H22"></path>
      </svg>
    ),
    safari: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="2" x2="12" y2="4"></line>
        <line x1="12" y1="20" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="4" y2="12"></line>
        <line x1="20" y1="12" x2="22" y2="12"></line>
        <line x1="6.34" y1="17.66" x2="4.93" y2="19.07"></line>
        <line x1="19.07" y1="4.93" x2="17.66" y2="6.34"></line>
      </svg>
    ),
    edge: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M20.24 12.24C20.1685 14.6403 18.9179 16.8611 16.8569 18.2136C14.796 19.5662 12.1773 19.863 9.90206 19.0147C7.62681 18.1663 5.88552 16.2623 5.22228 13.9117C4.55903 11.5611 5.05886 9.04016 6.57 7.12C5.04126 9.0795 4.60986 11.6338 5.40242 13.9057C6.19498 16.1775 8.10481 17.8773 10.4644 18.528C12.824 19.1788 15.3551 18.7052 17.3225 17.2471C19.2899 15.789 20.4109 13.5226 20.36 11.13L20.24 12.24Z"></path>
        <path d="M3.34009 7C5.33015 4.5912 8.42099 3.2551 11.6278 3.39767C14.8347 3.54024 17.7982 5.15213 19.6 7.72001L20.5 9"></path>
        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path>
      </svg>
    )
  };

  const iconComponent = browserIcons[browser.toLowerCase() as keyof typeof browserIcons] || browserIcons.chrome;

  const handleDownload = () => {
    // In a real implementation, this could track analytics
    // or show a specific platform's installation modal
    window.open(instructions.downloadUrl, '_blank');
    toast({
      title: "Download started",
      description: `JagJar for ${browser} will download shortly.`,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className={className}
            onClick={() => setIsOpen(true)}
          >
            {showIcon && iconComponent}
            {instructions.downloadText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{instructions.title}</DialogTitle>
            <DialogDescription>
              Follow these steps to install the JagJar extension for {browser}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ol className="list-decimal pl-5 space-y-2">
              {instructions.steps.map((step, index) => (
                <li key={index} className="text-sm">{step}</li>
              ))}
            </ol>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{instructions.storeText}</span>
            <Button onClick={handleDownload}>
              Download Extension
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}