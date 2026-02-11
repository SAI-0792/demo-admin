"use client"

import { useState } from "react"
import { useHotelStore } from "@/core/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    BedDouble,
    Users,
    Banknote,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Clock,
    Plus,
    ArrowRight,
    Receipt,
    Utensils,
    Shirt,
    CalendarDays,
    Wrench,
    Menu,
    User,
    UserPlus,
    CalendarRange,
    CreditCard,
    Upload,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { type Booking } from "@/core/lib/store"
import { format, isWithinInterval, areIntervalsOverlapping, parseISO } from "date-fns"

export default function RoomPosPage() {
    const hotelData = useHotelStore((state) => state.hotelData)
    const updateRoom = useHotelStore((state) => state.updateRoom)
    const addBooking = useHotelStore((state) => state.addBooking)
    const updateBooking = useHotelStore((state) => state.updateBooking)

    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [selectedCapacities, setSelectedCapacities] = useState<string[]>([])
    const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    // Search & Filter State
    const [dateRange, setDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    })
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])

    // Sheet States
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
    const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false)
    const [isPosSheetOpen, setIsPosSheetOpen] = useState(false)
    const [isMaintenanceSheetOpen, setIsMaintenanceSheetOpen] = useState(false)
    const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
    const [checkoutTarget, setCheckoutTarget] = useState<"available" | "maintenance">("available")
    const [maintenanceNote, setMaintenanceNote] = useState("")

    // Booking Form State
    const [bookingForm, setBookingForm] = useState({
        guestName: "",
        phone: "",
        idProof: "",
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: "",
        guestCount: 1,
        advancePayment: 0,
        idProofImage: "",
    })

    // POS Form State
    const [posForm, setPosForm] = useState({
        type: "room-service" as "room-service" | "laundry",
        item: "",
        quantity: 1,
        price: 0,
        isExpress: false, // for laundry
    })

    const categories = hotelData.categories
    const rooms = hotelData.rooms
    const bookings = hotelData.bookings

    const getActiveBooking = (roomId: string) => {
        return bookings.find(
            (b) => b.roomId === roomId && ["checked-in", "confirmed"].includes(b.status)
        )
    }

    // Helper to check availability
    const isRoomAvailable = (roomId: string, start: string, end: string) => {
        const room = rooms.find(r => r.id === roomId)
        if (!room || room.status === "maintenance") return false

        // Find existing bookings that overlap with requested range
        const hasOverlap = bookings.some(b => {
            if (b.roomId !== roomId || ["cancelled", "completed"].includes(b.status)) return false
            const bookingStart = parseISO(b.checkIn)
            const bookingEnd = parseISO(b.checkOut)
            const rangeStart = parseISO(start)
            const rangeEnd = parseISO(end)

            return areIntervalsOverlapping(
                { start: bookingStart, end: bookingEnd },
                { start: rangeStart, end: rangeEnd }
            )
        })

        return !hasOverlap
    }

    const filteredRooms = rooms
        .filter((room) => {
            if (selectedCategory !== "all" && room.categoryId !== selectedCategory) return false

            // Capacity Filter (Multi-select)
            if (selectedCapacities.length > 0 && !selectedCapacities.includes(String(room.capacity))) return false

            return true
        })
        .sort((a, b) => {
            if (priceSort === "asc") return a.price - b.price
            if (priceSort === "desc") return b.price - a.price
            return 0
        })

    // Compute status based on Date Range logic, not just 'status' field
    const roomsWithComputedStatus = filteredRooms.map(r => ({
        ...r,
        computedStatus: isRoomAvailable(r.id, dateRange.from, dateRange.to) ? "available" : (r.status === "maintenance" ? "maintenance" : "occupied")
    }))

    const availableRooms = roomsWithComputedStatus.filter((r) => r.computedStatus === "available")
    const occupiedMaintenanceRooms = roomsWithComputedStatus.filter((r) => r.computedStatus !== "available")

    const handleRoomClick = (room: any) => {
        // If room is occupied/maintenance, open sheets directly (Legacy behavior for management)
        if (room.computedStatus !== "available") {
            setSelectedRoomId(room.id)
            if (room.status === "maintenance") {
                setIsMaintenanceSheetOpen(true)
            } else {
                setIsPosSheetOpen(true)
            }
            return;
        }

        // Toggle Selection for Booking
        if (selectedRoomIds.includes(room.id)) {
            setSelectedRoomIds(prev => prev.filter(id => id !== room.id))
        } else {
            setSelectedRoomIds(prev => [...prev, room.id])
        }
    }

    const openBookingSheet = () => {
        if (selectedRoomIds.length === 0) return
        // Set up form with default values
        setBookingForm({
            guestName: "",
            phone: "",
            idProof: "",
            checkIn: dateRange.from,
            checkOut: dateRange.to,
            guestCount: 1, // Default, maybe sum of capacities?
            advancePayment: 0,
            idProofImage: "",
        })
        setIsBookingSheetOpen(true)
    }

    const handleCreateBooking = () => {
        if (selectedRoomIds.length === 0) return

        selectedRoomIds.forEach(roomId => {
            const newBooking = {
                id: `book-${Date.now()}-${roomId}`,
                roomId: roomId,
                guestName: bookingForm.guestName,
                email: "",
                phone: bookingForm.phone,
                checkIn: bookingForm.checkIn,
                checkOut: bookingForm.checkOut,
                totalPrice: 0,
                status: "confirmed" as "confirmed" | "checked-in", // Confirmed for future dates
                guestCount: Math.ceil(bookingForm.guestCount / selectedRoomIds.length), // Distribute count roughly
                idProof: bookingForm.idProof,
                advancePayment: Number(bookingForm.advancePayment) / selectedRoomIds.length, // Split advance
                folioCharges: [],
            }

            const room = rooms.find(r => r.id === roomId);
            if (room && bookingForm.checkOut) {
                const start = new Date(bookingForm.checkIn);
                const end = new Date(bookingForm.checkOut);
                const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                newBooking.totalPrice = (nights > 0 ? nights : 1) * room.price;
            }

            // If check-in is today, mark room as occupied
            const isToday = new Date().toISOString().split('T')[0] === bookingForm.checkIn;
            if (isToday) {
                newBooking.status = "checked-in";
                updateRoom(roomId, { status: "occupied" })
            }

            addBooking(newBooking)
        })

        setSelectedRoomIds([])
        setIsBookingSheetOpen(false)
    }

    const handleAddCharge = () => {
        if (!selectedRoomId) return
        const booking = getActiveBooking(selectedRoomId)
        if (!booking) return

        const charge = {
            id: `charge-${Date.now()}`,
            date: new Date().toISOString(),
            type: posForm.type,
            item: posForm.item,
            quantity: Number(posForm.quantity),
            price: Number(posForm.price),
            total: Number(posForm.quantity) * Number(posForm.price) + (posForm.isExpress ? 50 : 0), // Flat 50 for express
        }

        const updatedCharges = [...(booking.folioCharges || []), charge]
        updateBooking(booking.id, { folioCharges: updatedCharges })

        // Reset form
        setPosForm({ ...posForm, item: "", quantity: 1, price: 0 })
    }

    const handleCheckout = () => {
        if (!selectedRoomId) return
        const booking = getActiveBooking(selectedRoomId)
        if (!booking) return

        // Open checkout dialog instead of confirm
        setCheckoutTarget("available")
        setMaintenanceNote("")
        setIsCheckoutDialogOpen(true)
    }

    const confirmCheckout = () => {
        if (!selectedRoomId) return
        const booking = getActiveBooking(selectedRoomId)
        if (!booking) return

        updateBooking(booking.id, { status: "completed" })
        updateRoom(selectedRoomId, { status: checkoutTarget })
        setIsCheckoutDialogOpen(false)
        setIsPosSheetOpen(false)
    }

    const handleExtendStay = (newDate: string) => {
        if (!selectedRoomId) return
        const booking = getActiveBooking(selectedRoomId)
        if (!booking) return

        updateBooking(booking.id, { checkOut: newDate });
        // Recalculate base price if needed
        // Simulating price update for now
        alert("Stay extended! Please verify total price.");
    }


    const calculateTotalBill = (booking: any) => {
        if (!booking) return 0;
        const chargesTotal = booking.folioCharges?.reduce((acc: number, curr: any) => acc + curr.total, 0) || 0;

        // Re-calculate room rent based on current dates in case extended
        // This is a simplified logic
        // Assuming totalPrice in booking is the room rent
        return booking.totalPrice + chargesTotal - (booking.advancePayment || 0);
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-muted/20">
            {/* Sidebar - Room Categories */}
            <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} border-r border-border/40 bg-card/50 backdrop-blur-xl supports-[backdrop-filter]:bg-card/20 hidden md:flex flex-col transition-all duration-300 z-20`}>
                {/* Header with Hamburger Menu */}
                <div className="p-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="shrink-0 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    {!isSidebarCollapsed && (
                        <div className="grid gap-0.5 animate-in fade-in slide-in-from-left-4 duration-300">
                            <span className="font-bold text-lg tracking-tight">Room Types</span>
                            <span className="text-xs text-muted-foreground font-medium">Category Filter</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-2 py-4">
                        <Button
                            variant={selectedCategory === "all" ? "secondary" : "ghost"}
                            className={`w-full justify-start h-12 rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} ${selectedCategory === "all" ? "bg-primary/10 text-primary hover:bg-primary/15" : "hover:bg-accent/50 text-muted-foreground"}`}
                            onClick={() => setSelectedCategory("all")}
                        >
                            <BedDouble className={`w-5 h-5 ${!isSidebarCollapsed && "mr-3"}`} />
                            {!isSidebarCollapsed && (
                                <div className="flex flex-1 items-center justify-between">
                                    <span className="font-medium">All Types</span>
                                    <Badge variant="secondary" className="bg-background/50 ml-auto">{rooms.length}</Badge>
                                </div>
                            )}
                        </Button>
                        {categories.map((cat) => {
                            const count = rooms.filter(r => r.categoryId === cat.id).length;
                            const isActive = selectedCategory === cat.id;
                            return (
                                <Button
                                    key={cat.id}
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start h-12 rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} ${isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : "hover:bg-accent/50 text-muted-foreground"}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <BedDouble className={`w-5 h-5 ${!isSidebarCollapsed && "mr-3"}`} />
                                    {!isSidebarCollapsed && (
                                        <div className="flex flex-1 items-center justify-between">
                                            <span className="font-medium truncate">{cat.name}</span>
                                            <Badge variant="secondary" className="bg-background/50 ml-auto">{count}</Badge>
                                        </div>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>

                {/* Quick Stats */}
                {!isSidebarCollapsed ? (
                    <div className="p-6 border-t border-border/40 bg-card/30">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Live Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">Available</span>
                                </div>
                                <span className="font-mono font-bold text-emerald-600">{availableRooms.length}</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">Occupied</span>
                                </div>
                                <span className="font-mono font-bold text-rose-600">{occupiedMaintenanceRooms.filter(r => r.computedStatus === "occupied").length}</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">Maintenance</span>
                                </div>
                                <span className="font-mono font-bold text-amber-600">{occupiedMaintenanceRooms.filter(r => r.computedStatus === "maintenance").length}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col gap-4 items-center border-t border-border/40 bg-card/30">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" title="Available" />
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" title="Occupied" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" title="Maintenance" />
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Bar - Modernized Toolbar */}
                <header className="px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-6 bg-background/60 backdrop-blur-md sticky top-0 z-10 border-b border-border/40">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Room Operations</h1>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Manage bookings & real-time status</p>
                    </div>

                    <div className="flex items-center gap-3 bg-card/60 backdrop-blur-sm p-1.5 rounded-2xl border border-border/40 shadow-sm">
                        {/* Date Selection */}
                        <div className="flex items-center gap-2 pl-2">
                            <CalendarDays className="w-4 h-4 text-primary" />
                            <div className="flex items-center bg-background rounded-xl border border-border/50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <div className="grid gap-0.5">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Check In</span>
                                    <input
                                        type="date"
                                        className="h-5 w-[110px] bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                                        value={dateRange.from}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                    />
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground/30 mx-3" />
                                <div className="grid gap-0.5">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Check Out</span>
                                    <input
                                        type="date"
                                        className="h-5 w-[110px] bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                                        value={dateRange.to}
                                        min={dateRange.from}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-border/50 mx-1" />

                        {/* Filters */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 px-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="font-medium text-sm">
                                        {selectedCapacities.length > 0 ? `${selectedCapacities.length} Types` : "Capacity"}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[220px] p-0 shadow-xl border-border/40" align="end">
                                <Command>
                                    <CommandList>
                                        <CommandGroup heading="Filter by Capacity">
                                            {["1", "2", "3", "4", "5", "6"].map((cap) => (
                                                <CommandItem
                                                    key={cap}
                                                    onSelect={() => {
                                                        setSelectedCapacities(prev =>
                                                            prev.includes(cap)
                                                                ? prev.filter(c => c !== cap)
                                                                : [...prev, cap]
                                                        )
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <div className={`mr-3 flex h-4 w-4 items-center justify-center rounded border transition-all ${selectedCapacities.includes(cap) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 opacity-50"}`}>
                                                        {selectedCapacities.includes(cap) && <CheckCircle2 className="h-3 w-3" />}
                                                    </div>
                                                    <span className="font-medium">{cap} Person{Number(cap) > 1 ? "s" : ""}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Select value={priceSort || ""} onValueChange={(v: any) => setPriceSort(v)}>
                            <SelectTrigger className="w-[110px] h-10 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-colors">
                                <div className="flex items-center gap-2">
                                    <Banknote className="w-4 h-4" />
                                    <SelectValue placeholder="Price" />
                                </div>
                            </SelectTrigger>
                            <SelectContent align="end" className="shadow-xl border-border/40">
                                <SelectItem value="asc">Low to High</SelectItem>
                                <SelectItem value="desc">High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </header >

                {/* Room Grid */}
                {/* Room Grid */}
                <ScrollArea className="flex-1 p-6 bg-muted/20 pb-24">
                    <div className="max-w-7xl mx-auto space-y-10">
                        {/* Available Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">Available Rooms</h2>
                                    <p className="text-sm text-muted-foreground font-medium">{availableRooms.length} rooms ready for check-in</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {availableRooms.length === 0 && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-border/60 bg-card/50">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <BedDouble className="w-8 h-8 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="font-semibold text-lg">No rooms available</h3>
                                        <p className="text-muted-foreground text-sm max-w-xs mt-1">Try adjusting your date range or filters to find available rooms.</p>
                                    </div>
                                )}
                                {availableRooms.map((room) => {
                                    const isSelected = selectedRoomIds.includes(room.id);
                                    return (
                                        <div
                                            key={room.id}
                                            onClick={() => handleRoomClick(room)}
                                            className={`
                                                group relative bg-card rounded-2xl p-5 cursor-pointer transition-all duration-300
                                                border border-border/50 hover:border-primary/50
                                                ${isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/10' : 'hover:shadow-lg hover:-translate-y-1'}
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{room.name}</h3>
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{categories.find(c => c.id === room.categoryId)?.name}</span>
                                                </div>
                                                <div className={`
                                                    w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                                                    ${isSelected ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}
                                                `}>
                                                    {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-4 h-4" />
                                                        <span>{room.capacity}</span>
                                                    </div>
                                                    <div className="h-3 w-px bg-border" />
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-foreground">₹{room.price}</span>
                                                        <span className="text-xs">/night</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Selection Overlay Effect */}
                                            {isSelected && <div className="absolute inset-0 bg-primary/5 rounded-2xl pointer-events-none" />}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        <Separator className="bg-border/40" />

                        {/* Occupied / Maintenance Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-amber-500 rounded-full" />
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">Occupied & Maintenance</h2>
                                    <p className="text-sm text-muted-foreground font-medium">Rooms unavailable for selected dates</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {occupiedMaintenanceRooms.map((room) => {
                                    const booking = getActiveBooking(room.id);
                                    const isOccupied = room.computedStatus === "occupied";
                                    const statusColor = isOccupied ? "text-rose-500" : "text-amber-500";
                                    const statusBg = isOccupied ? "bg-rose-500/10" : "bg-amber-500/10";
                                    const statusBorder = isOccupied ? "border-rose-200/20" : "border-amber-200/20";

                                    return (
                                        <div
                                            key={room.id}
                                            onClick={() => handleRoomClick(room)}
                                            className={`
                                                group relative bg-card/60 rounded-2xl p-5 cursor-pointer transition-all duration-300
                                                border border-border/40 hover:bg-card hover:border-border
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-muted-foreground">{room.name}</h3>
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{categories.find(c => c.id === room.categoryId)?.name}</span>
                                                </div>
                                                <Badge variant="outline" className={`${statusBg} ${statusColor} ${statusBorder} border`}>
                                                    {room.computedStatus}
                                                </Badge>
                                            </div>

                                            <div className="pt-4 border-t border-border/30">
                                                {isOccupied && booking ? (
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                                            <Users className="w-3.5 h-3.5" />
                                                            <span>{booking.guestName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <CalendarDays className="w-3.5 h-3.5" />
                                                            <span>Until {format(parseISO(booking.checkOut), 'MMM dd')}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Unavailable for dates</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </div>
                </ScrollArea>


            </div >





            {/* Booking Sheet */}
            < Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen} >
                <SheetContent className="sm:max-w-md w-full overflow-y-auto">
                    <SheetHeader className="space-y-1 pb-4 border-b border-border/40">
                        <SheetTitle className="flex items-center gap-2 text-xl">
                            <UserPlus className="w-5 h-5 text-primary" />
                            New Check-In
                        </SheetTitle>
                        <SheetDescription className="text-xs font-medium">
                            Room {rooms.find(r => r.id === selectedRoomId)?.name} • <span className="text-foreground">₹{rooms.find(r => r.id === selectedRoomId)?.price}</span>/night
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        {/* Guest Information */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <User className="w-4 h-4 text-primary/70" /> Guest Details
                            </h4>
                            <div className="grid gap-4 p-4 rounded-xl border border-border/40 bg-muted/20">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground ml-1">Full Name</Label>
                                    <Input
                                        value={bookingForm.guestName}
                                        onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                                        placeholder="e.g. John Doe"
                                        className="bg-background/50 border-border/40 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground ml-1">Phone Number</Label>
                                        <Input
                                            value={bookingForm.phone}
                                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                            placeholder="+91..."
                                            className="bg-background/50 border-border/40 focus:bg-background transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground ml-1">Guests</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={bookingForm.guestCount}
                                            onChange={(e) => setBookingForm({ ...bookingForm, guestCount: Number(e.target.value) })}
                                            className="bg-background/50 border-border/40 focus:bg-background transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground ml-1">ID Proof</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={bookingForm.idProof}
                                            onChange={(e) => setBookingForm({ ...bookingForm, idProof: e.target.value })}
                                            placeholder="Document Number"
                                            className="bg-background/50 border-border/40 focus:bg-background transition-colors"
                                        />
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="id-proof-upload"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setBookingForm(prev => ({ ...prev, idProofImage: reader.result as string }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <Label
                                                htmlFor="id-proof-upload"
                                                className="h-10 px-3 flex items-center justify-center border border-border/40 rounded-md bg-background/50 hover:bg-muted cursor-pointer transition-colors"
                                                title="Upload ID Image"
                                            >
                                                <Upload className="w-4 h-4 text-muted-foreground" />
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stay Information */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <CalendarRange className="w-4 h-4 text-primary/70" /> Stay Dates
                            </h4>
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/40 bg-muted/20">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground ml-1">Check-in</Label>
                                    <Input
                                        type="date"
                                        value={bookingForm.checkIn}
                                        onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                                        className="bg-background/50 border-border/40 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground ml-1">Check-out</Label>
                                    <Input
                                        type="date"
                                        value={bookingForm.checkOut}
                                        onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                                        className="bg-background/50 border-border/40 focus:bg-background transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <CreditCard className="w-4 h-4 text-primary/70" /> Payment
                            </h4>

                            {/* Payment Summary Calculation */}
                            {bookingForm.checkIn && bookingForm.checkOut && selectedRoomId && (
                                <div className="bg-gradient-to-br from-muted/50 to-muted/20 p-4 rounded-xl border border-border/40 space-y-3 shadow-sm">

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Room Rate</span>
                                            <span>₹{rooms.find(r => r.id === selectedRoomId)?.price} × 1 night</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Duration</span>
                                            <span>
                                                {(() => {
                                                    const start = new Date(bookingForm.checkIn);
                                                    const end = new Date(bookingForm.checkOut);
                                                    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                                    return nights > 0 ? `${nights} Nights` : "0 Nights";
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator className="bg-border/40" />

                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground ml-1">Advance Payment</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={bookingForm.advancePayment}
                                                    onChange={(e) => setBookingForm({ ...bookingForm, advancePayment: Number(e.target.value) })}
                                                    className="pl-7 bg-background border-border/40 focus:bg-background transition-colors h-9"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-background/60 p-3 rounded-lg border border-border/30 flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">To Pay at Checkout</span>
                                            <span className="text-lg font-bold text-primary">₹{(() => {
                                                const room = rooms.find(r => r.id === selectedRoomId);
                                                if (!room) return 0;
                                                const start = new Date(bookingForm.checkIn);
                                                const end = new Date(bookingForm.checkOut);
                                                const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                                const total = (nights > 0 ? nights : 1) * room.price;
                                                return Math.max(0, total - Number(bookingForm.advancePayment || 0));
                                            })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <SheetFooter className="pt-2 border-t border-border/40 mt-auto">
                        <SheetClose asChild>
                            <Button variant="ghost" className="hover:bg-muted">Cancel</Button>
                        </SheetClose>
                        <Button onClick={handleCreateBooking} className="px-8 font-semibold shadow-lg shadow-primary/20">Confirm Check-In</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet >


            {/* Floating Booking Action Bar */}
            {selectedRoomIds.length > 0 && (
                <div className="fixed bottom-6 w-full flex justify-center z-50 pointer-events-none">
                    <div className="bg-foreground/95 backdrop-blur-md text-background pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 pointer-events-auto border border-white/10 animate-in slide-in-from-bottom-5 duration-300">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-background text-foreground text-xs font-bold">
                                    {selectedRoomIds.length}
                                </span>
                                <span className="text-sm font-medium">Selected</span>
                            </div>

                            <Separator orientation="vertical" className="h-4 bg-background/20" />

                            <div className="flex flex-col">
                                <span className="text-[10px] text-background/60 uppercase tracking-wider font-medium">Total Estimate</span>
                                <span className="text-sm font-bold font-mono">
                                    ₹{(() => {
                                        const totalPerNight = selectedRoomIds.reduce((sum, id) => {
                                            const room = rooms.find(r => r.id === id);
                                            return sum + (room?.price || 0);
                                        }, 0);

                                        const start = new Date(dateRange.from);
                                        const end = new Date(dateRange.to);
                                        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

                                        return (totalPerNight * nights).toLocaleString();
                                    })()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 px-3 text-background/70 hover:text-background hover:bg-white/10 rounded-full"
                                onClick={() => setSelectedRoomIds([])}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-full px-6 font-bold bg-background text-foreground hover:bg-background/90 transition-colors h-10 shadow-lg shadow-black/20"
                                onClick={() => setIsBookingSheetOpen(true)}
                            >
                                Book Now <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* POS & Management Sheet */}
            < Sheet open={isPosSheetOpen} onOpenChange={setIsPosSheetOpen} >
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    {selectedRoomId && (
                        <>
                            <SheetHeader>
                                <SheetTitle className="flex justify-between items-center">
                                    <span>Room {rooms.find(r => r.id === selectedRoomId)?.name}</span>
                                    <Badge variant="outline">{getActiveBooking(selectedRoomId)?.status}</Badge>
                                </SheetTitle>
                                <SheetDescription>
                                    Guest: {getActiveBooking(selectedRoomId)?.guestName}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6">
                                <Tabs defaultValue="pos">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="pos">Add Charge</TabsTrigger>
                                        <TabsTrigger value="folio">Folio & Actions</TabsTrigger>
                                    </TabsList>

                                    {/* POS Tab */}
                                    <TabsContent value="pos" className="space-y-4 pt-4">
                                        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                                            <h3 className="font-medium text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Service</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <Label>Service Type</Label>
                                                    <Select
                                                        value={posForm.type}
                                                        onValueChange={(v: any) => setPosForm({ ...posForm, type: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="room-service">Room Service (Food)</SelectItem>
                                                            <SelectItem value="laundry">Laundry</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-2">
                                                    <Label>Item Description</Label>
                                                    <Input
                                                        placeholder="e.g., Club Sandwich / Shirt Ironing"
                                                        value={posForm.item}
                                                        onChange={(e) => setPosForm({ ...posForm, item: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Price (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        value={posForm.price}
                                                        onChange={(e) => setPosForm({ ...posForm, price: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={posForm.quantity}
                                                        onChange={(e) => setPosForm({ ...posForm, quantity: Number(e.target.value) })}
                                                    />
                                                </div>
                                                {posForm.type === "laundry" && (
                                                    <div className="col-span-2 flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="express"
                                                            className="w-4 h-4"
                                                            checked={posForm.isExpress}
                                                            onChange={(e) => setPosForm({ ...posForm, isExpress: e.target.checked })}
                                                        />
                                                        <Label htmlFor="express">Express Service (+ ₹50)</Label>
                                                    </div>
                                                )}
                                            </div>
                                            <Button className="w-full" onClick={handleAddCharge}>Post Charge</Button>
                                        </div>
                                    </TabsContent>

                                    {/* Folio Tab */}
                                    <TabsContent value="folio" className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <h3 className="font-medium">Current Bill Summary</h3>
                                            <div className="rounded-md border">
                                                <div className="p-3 flex justify-between text-sm">
                                                    <span>Room Rent ({getActiveBooking(selectedRoomId)?.totalPrice ? "Estimated" : "-"})</span>
                                                    <span>₹{getActiveBooking(selectedRoomId)?.totalPrice}</span>
                                                </div>
                                                {getActiveBooking(selectedRoomId)?.folioCharges?.map((charge) => (
                                                    <div key={charge.id} className="p-3 border-t flex justify-between text-sm">
                                                        <span>{charge.item} ({charge.quantity}x)</span>
                                                        <span>₹{charge.total}</span>
                                                    </div>
                                                ))}
                                                <div className="p-3 border-t flex justify-between text-sm text-green-600">
                                                    <span>Advance Payment</span>
                                                    <span>- ₹{getActiveBooking(selectedRoomId)?.advancePayment}</span>
                                                </div>
                                                <div className="p-3 border-t flex justify-between font-bold bg-muted/50">
                                                    <span>Total Due</span>
                                                    <span>₹{calculateTotalBill(getActiveBooking(selectedRoomId))}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-medium mb-2">Actions</h3>
                                            <div className="grid gap-2">
                                                <div className="flex gap-2 items-center">
                                                    <Input type="date" className="flex-1" />
                                                    <Button variant="outline" size="sm" onClick={() => handleExtendStay("2024-12-31")}>Extend</Button>
                                                </div>
                                                <Button variant="destructive" className="w-full mt-4" onClick={handleCheckout}>
                                                    Check Out & Settle Bill
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet >

            {/* Maintenance Sheet */}
            < Sheet open={isMaintenanceSheetOpen} onOpenChange={setIsMaintenanceSheetOpen} >
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Maintenance Control</SheetTitle>
                        <SheetDescription>
                            Room {rooms.find(r => r.id === selectedRoomId)?.name}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-yellow-900">Room Status: Maintenance</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    This room is currently blocked for housekeeping or repairs and cannot be booked.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label>Maintenance Notes</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Reason for maintenance... (e.g., AC Repair, Deep Cleaning)"
                            />
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                    if (selectedRoomId) {
                                        updateRoom(selectedRoomId, { status: "available" });
                                        setIsMaintenanceSheetOpen(false);
                                    }
                                }}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as Ready / Available
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsMaintenanceSheetOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet >

            {/* Checkout Confirmation Dialog */}
            < Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen} >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Checkout</DialogTitle>
                        <DialogDescription>
                            Room {rooms.find(r => r.id === selectedRoomId)?.name} - Complete bill: ₹{calculateTotalBill(getActiveBooking(selectedRoomId || ""))}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">After checkout, set room status to:</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant={checkoutTarget === "available" ? "default" : "outline"}
                                className={checkoutTarget === "available" ? "bg-green-600 hover:bg-green-700" : ""}
                                onClick={() => setCheckoutTarget("available")}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Available
                            </Button>
                            <Button
                                variant={checkoutTarget === "maintenance" ? "default" : "outline"}
                                className={checkoutTarget === "maintenance" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                                onClick={() => setCheckoutTarget("maintenance")}
                            >
                                <Wrench className="w-4 h-4 mr-2" />
                                Maintenance
                            </Button>
                        </div>

                        {checkoutTarget === "maintenance" && (
                            <div className="grid gap-2">
                                <Label>Maintenance Reason (Optional)</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="e.g., Deep cleaning required, AC needs servicing..."
                                    value={maintenanceNote}
                                    onChange={(e) => setMaintenanceNote(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmCheckout}>
                            Confirm Checkout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

        </div >
    )
}
