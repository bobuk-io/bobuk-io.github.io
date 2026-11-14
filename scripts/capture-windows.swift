// Capture every visible window of one process as a PNG without the system shadow.
// See docs/updating.md → «Скриншоты».
//
//   swift scripts/capture-windows.swift <pid | process name> <output prefix>
//   → <prefix>-0.png, <prefix>-1.png, … and a line per window: file, window id, title, size.
//
// The terminal needs Screen Recording permission (System Settings → Privacy & Security).
// Windows smaller than 120 pt or mostly transparent (a panel still fading in) are skipped.
import CoreGraphics
import Foundation

let arguments = CommandLine.arguments
guard arguments.count == 3 else {
    FileHandle.standardError.write("usage: swift scripts/capture-windows.swift <pid | process name> <output prefix>\n".data(using: .utf8)!)
    exit(1)
}
let target = arguments[1], prefix = arguments[2]
guard CGPreflightScreenCaptureAccess() else {
    FileHandle.standardError.write("Screen Recording permission is missing for this terminal.\n".data(using: .utf8)!)
    exit(1)
}
let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
let matches = windows.filter { window in
    if let pid = Int32(target) { return window[kCGWindowOwnerPID as String] as? Int32 == pid }
    return (window[kCGWindowOwnerName as String] as? String)?.caseInsensitiveCompare(target) == .orderedSame
}
var count = 0
for window in matches {
    let bounds = window[kCGWindowBounds as String] as? [String: Double] ?? [:]
    let width = bounds["Width"] ?? 0, height = bounds["Height"] ?? 0
    guard width >= 120, height >= 120, (window[kCGWindowAlpha as String] as? Double ?? 1) >= 0.5,
          let id = window[kCGWindowNumber as String] as? Int else { continue }
    let output = "\(prefix)-\(count).png"
    let capture = Process()
    capture.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
    capture.arguments = ["-x", "-o", "-l", String(id), output]
    try capture.run()
    capture.waitUntilExit()
    print(output, id, window[kCGWindowName as String] as? String ?? "", Int(width), Int(height))
    count += 1
}
if count == 0 {
    FileHandle.standardError.write("No visible windows for \(target). Is the panel open (and not still fading in)?\n".data(using: .utf8)!)
    exit(1)
}
