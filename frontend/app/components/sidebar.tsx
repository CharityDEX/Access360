import { Button } from "@/components/ui/button"
import { Home, Mic2, Wand2, Bell, Chrome, Settings } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-gray-50/50 p-4 flex flex-col">
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Mic2 className="mr-2 h-4 w-4" />
          My Recordings
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Wand2 className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="px-3 text-sm font-medium text-gray-500">FOLDERS</h3>
        <div className="mt-2 space-y-2">
          <Button variant="ghost" className="w-full justify-start font-normal">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start pl-9 font-normal">
            santa clara university
          </Button>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <h3 className="px-3 text-sm font-medium text-gray-500">OTHER</h3>
        <Button variant="ghost" className="w-full justify-start">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Chrome className="mr-2 h-4 w-4" />
          Install Chrome Extension
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}

