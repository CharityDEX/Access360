import { Avatar } from "@/components/ui/avatar"

export function RecordingsList() {
  const recordings = [
    {
      id: 1,
      name: "Recording 2025-02-14T03:13:36.689Z",
      privacy: "Private",
      date: "Feb 13, 2025",
    },
    {
      id: 2,
      name: "Recording 2025-02-14T02:31:06.214Z",
      privacy: "Private",
      date: "Feb 13, 2025",
    },
    {
      id: 3,
      name: "Recording 2025-02-12T08:21:39.379Z",
      privacy: "Private",
      date: "Feb 12, 2025",
    },
    {
      id: 4,
      name: "Recording 2025-02-12T08:19:01.417Z",
      privacy: "Private",
      date: "Feb 12, 2025",
    },
    {
      id: 5,
      name: "Recording 2025-02-11T02:22:52.354Z",
      privacy: "Private",
      date: "Feb 10, 2025",
    },
  ]

  return (
    <div className="space-y-4">
      {recordings.map((recording) => (
        <div
          key={recording.id}
          className="flex items-start gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
        >
          <Avatar className="h-10 w-10 rounded-lg bg-orange-500 text-white">
            <span className="text-lg">S</span>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{recording.name}</h3>
            <p className="text-sm text-gray-500">
              {recording.privacy} • {recording.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

