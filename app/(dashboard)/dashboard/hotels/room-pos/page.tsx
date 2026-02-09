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
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

export default function RoomPosPage() {
    const hotelData = useHotelStore((state) => state.hotelData)
    const updateRoom = useHotelStore((state) => state.updateRoom)
    const addBooking = useHotelStore((state) => state.addBooking)
    const updateBooking = useHotelStore((state) => state.updateBooking)

    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [capacityFilter, setCapacityFilter] = useState<string>("all")
    const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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

    const filteredRooms = rooms
        .filter((room) => {
            if (selectedCategory !== "all" && room.categoryId !== selectedCategory) return false
            if (capacityFilter !== "all" && room.capacity !== Number(capacityFilter)) return false
            return true
        })
        .sort((a, b) => {
            if (priceSort === "asc") return a.price - b.price
            if (priceSort === "desc") return b.price - a.price
            return 0
        })

    const availableRooms = filteredRooms.filter((r) => r.status === "available")
    const occupiedMaintenanceRooms = filteredRooms.filter((r) => r.status !== "available")

    const handleRoomClick = (room: any) => {
        setSelectedRoomId(room.id)
        if (room.status === "available") {
            setBookingForm({
                guestName: "",
                phone: "",
                idProof: "",
                checkIn: new Date().toISOString().split('T')[0],
                checkOut: "",
                guestCount: room.capacity,
                advancePayment: 0,
                idProofImage: "",
            })
            setIsBookingSheetOpen(true)
        } else if (room.status === "occupied") {
            setIsPosSheetOpen(true)
        } else {
            // Maintenance - Open Sheet
            setIsMaintenanceSheetOpen(true)
        }
    }

    const handleCreateBooking = () => {
        if (!selectedRoomId) return
        const newBooking = {
            id: `book-${Date.now()}`,
            roomId: selectedRoomId,
            guestName: bookingForm.guestName,
            email: "", // Optional in this quick view
            phone: bookingForm.phone,
            checkIn: bookingForm.checkIn,
            checkOut: bookingForm.checkOut,
            totalPrice: 0, // Calculated later or base price * nights
            status: "checked-in" as const,
            guestCount: bookingForm.guestCount,
            idProof: bookingForm.idProof,
            advancePayment: Number(bookingForm.advancePayment),
            folioCharges: [],
        }

        // Calculate total price base
        const room = rooms.find(r => r.id === selectedRoomId);
        if (room && bookingForm.checkOut) {
            const start = new Date(bookingForm.checkIn);
            const end = new Date(bookingForm.checkOut);
            const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            newBooking.totalPrice = (nights > 0 ? nights : 1) * room.price;
        }

        addBooking(newBooking)
        updateRoom(selectedRoomId, { status: "occupied" })
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
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar - Room Categories */}
            <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-72'} border-r border-border/30 bg-gradient-to-b from-sidebar to-sidebar/80 backdrop-blur-sm hidden md:flex flex-col transition-all duration-300`}>
                {/* Header with Hamburger Menu */}
                <div className="p-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                        >
                            <Menu className="size-5" />
                        </button>
                        {!isSidebarCollapsed && (
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-bold text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Room Types</span>
                                <span className="truncate text-xs text-muted-foreground">Filter by category</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-y-auto p-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
                    <div className="space-y-2">
                        <Button
                            variant={selectedCategory === "all" ? "default" : "ghost"}
                            className={`w-full justify-start transition-all duration-300 ${selectedCategory === "all" ? "bg-primary/90 shadow-lg shadow-primary/20" : "hover:bg-accent/50"}`}
                            onClick={() => setSelectedCategory("all")}
                        >
                            <BedDouble className="w-4 h-4 mr-2" />
                            {!isSidebarCollapsed && "All Types"}
                            {!isSidebarCollapsed && <Badge variant="secondary" className="ml-auto text-xs">{rooms.length}</Badge>}
                        </Button>
                        {categories.map((cat) => {
                            const count = rooms.filter(r => r.categoryId === cat.id).length;
                            return (
                                <Button
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? "default" : "ghost"}
                                    className={`w-full justify-start transition-all duration-300 ${selectedCategory === cat.id ? "bg-primary/90 shadow-lg shadow-primary/20" : "hover:bg-accent/50"}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <BedDouble className="w-4 h-4 mr-2" />
                                    {!isSidebarCollapsed && cat.name}
                                    {!isSidebarCollapsed && <Badge variant="secondary" className="ml-auto text-xs">{count}</Badge>}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats - only show when expanded */}
                {!isSidebarCollapsed && (
                    <div className="p-4 border-t border-border/30">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Today's Overview</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm">Available</span>
                                </div>
                                <span className="font-bold text-green-600">{rooms.filter(r => r.status === "available").length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-sm">Occupied</span>
                                </div>
                                <span className="font-bold text-red-600">{rooms.filter(r => r.status === "occupied").length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span className="text-sm">Maintenance</span>
                                </div>
                                <span className="font-bold text-yellow-600">{rooms.filter(r => r.status === "maintenance").length}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Collapsed State Icons */}
                {isSidebarCollapsed && (
                    <div className="flex flex-col items-center gap-4 p-4 mt-4">
                        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20" title={`${rooms.filter(r => r.status === "available").length} Available`}>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20" title={`${rooms.filter(r => r.status === "occupied").length} Occupied`}>
                            <Users className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20" title={`${rooms.filter(r => r.status === "maintenance").length} Maintenance`}>
                            <Wrench className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="border-b border-border/30 p-6 flex items-center justify-between bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">Room Operations</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage bookings, services & room status</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border/30">
                            <Users className="w-4 h-4 text-primary" />
                            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                                <SelectTrigger className="w-[130px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Capacity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Capacity</SelectItem>
                                    <SelectItem value="1">1 Person</SelectItem>
                                    <SelectItem value="2">2 People</SelectItem>
                                    <SelectItem value="3">3 People</SelectItem>
                                    <SelectItem value="4">4+ People</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border/30">
                            <Banknote className="w-4 h-4 text-primary" />
                            <Select value={priceSort || ""} onValueChange={(v: any) => setPriceSort(v)}>
                                <SelectTrigger className="w-[130px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Price Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">Low to High</SelectItem>
                                    <SelectItem value="desc">High to Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </header >

                {/* Room Grid */}
                < div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-background to-muted/20" >

                    {/* Available Section */}
                    < div className="mb-10" >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Available Rooms</h2>
                                <p className="text-xs text-muted-foreground">{availableRooms.length} rooms ready for check-in</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {availableRooms.length === 0 && (
                                <div className="col-span-full p-8 rounded-xl border border-dashed border-border/50 bg-muted/20 text-center">
                                    <BedDouble className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                                    <p className="text-muted-foreground">No available rooms matching filters.</p>
                                </div>
                            )}
                            {availableRooms.map((room) => (
                                <Card
                                    key={room.id}
                                    className="cursor-pointer group relative overflow-hidden backdrop-blur-sm border-border/30 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300"
                                    onClick={() => handleRoomClick(room)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600" />
                                    <CardContent className="p-5 relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-2xl font-bold group-hover:text-green-600 transition-colors">{room.name}</span>
                                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                    <BedDouble className="w-3 h-3" />
                                                    {categories.find(c => c.id === room.categoryId)?.name}
                                                </div>
                                            </div>
                                            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-500/20">
                                                ₹{room.price}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-border/30">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span>{room.capacity} Guest{room.capacity > 1 ? "s" : ""}</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div >

                    <Separator className="my-8 bg-border/30" />

                    {/* Occupied / Maintenance Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Occupied & Maintenance</h2>
                                <p className="text-xs text-muted-foreground">{occupiedMaintenanceRooms.length} rooms in use or blocked</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {occupiedMaintenanceRooms.length === 0 && (
                                <div className="col-span-full p-8 rounded-xl border border-dashed border-border/50 bg-muted/20 text-center">
                                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-500/50 mb-3" />
                                    <p className="text-muted-foreground">All rooms are available!</p>
                                </div>
                            )}
                            {occupiedMaintenanceRooms.map((room) => {
                                const booking = getActiveBooking(room.id);
                                const isOccupied = room.status === "occupied";
                                const gradientFrom = isOccupied ? "from-red-500/5" : "from-yellow-500/5";
                                const borderColor = isOccupied ? "from-red-400 to-red-600" : "from-yellow-400 to-yellow-600";
                                const hoverBorder = isOccupied ? "hover:border-red-500/50 hover:shadow-red-500/10" : "hover:border-yellow-500/50 hover:shadow-yellow-500/10";
                                const textHover = isOccupied ? "group-hover:text-red-600" : "group-hover:text-yellow-600";
                                const badgeClass = isOccupied
                                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                    : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";

                                return (
                                    <Card
                                        key={room.id}
                                        className={`cursor-pointer group relative overflow-hidden backdrop-blur-sm border-border/30 ${hoverBorder} hover:shadow-xl transition-all duration-300`}
                                        onClick={() => handleRoomClick(room)}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${borderColor}`} />
                                        <CardContent className="p-5 relative">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className={`text-2xl font-bold ${textHover} transition-colors`}>{room.name}</span>
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                        <BedDouble className="w-3 h-3" />
                                                        {categories.find(c => c.id === room.categoryId)?.name}
                                                    </div>
                                                </div>
                                                <Badge className={`${badgeClass} border-0 shadow-lg capitalize`}>
                                                    {room.status}
                                                </Badge>
                                            </div>
                                            <div className="pt-3 border-t border-border/30">
                                                {isOccupied && booking ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                                <Users className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{booking.guestName}</p>
                                                                <p className="text-xs text-muted-foreground">Checkout: {booking.checkOut}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20">
                                                                Due: ₹{calculateTotalBill(booking)}
                                                            </Badge>
                                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Wrench className="w-4 h-4 text-yellow-500" />
                                                            <span>Maintenance Mode</span>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                </div >
            </div >

            {/* Booking Sheet */}
            < Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen} >
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>New Check-In</SheetTitle>
                        <SheetDescription>
                            Room {rooms.find(r => r.id === selectedRoomId)?.name} • ₹{rooms.find(r => r.id === selectedRoomId)?.price}/night
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Guest Name</Label>
                            <Input
                                value={bookingForm.guestName}
                                onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                                placeholder="Enter Name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Phone</Label>
                                <Input
                                    value={bookingForm.phone}
                                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                    placeholder="+91..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Guests</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={bookingForm.guestCount}
                                    onChange={(e) => setBookingForm({ ...bookingForm, guestCount: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>ID Proof Details</Label>
                            <div className="gap-2 flex flex-col">
                                <Input
                                    value={bookingForm.idProof}
                                    onChange={(e) => setBookingForm({ ...bookingForm, idProof: e.target.value })}
                                    placeholder="Aadhar / Passport #"
                                />
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="text-sm"
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
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">(Optional)</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Check-In</Label>
                                <Input
                                    type="date"
                                    value={bookingForm.checkIn}
                                    onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Check-Out</Label>
                                <Input
                                    type="date"
                                    value={bookingForm.checkOut}
                                    onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Advance Payment (₹)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={bookingForm.advancePayment}
                                onChange={(e) => setBookingForm({ ...bookingForm, advancePayment: Number(e.target.value) })}
                            />
                        </div>

                        {/* Payment Summary Calculation */}
                        {bookingForm.checkIn && bookingForm.checkOut && selectedRoomId && (
                            <div className="bg-muted/50 p-3 rounded-lg space-y-2 mt-2 border">
                                <h3 className="font-semibold text-sm">Payment Estimation</h3>
                                <div className="flex justify-between text-sm">
                                    <span>Room Rate</span>
                                    <span>₹{rooms.find(r => r.id === selectedRoomId)?.price} / night</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Duration</span>
                                    <span>
                                        {(() => {
                                            const start = new Date(bookingForm.checkIn);
                                            const end = new Date(bookingForm.checkOut);
                                            const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                            return nights > 0 ? `${nights} Night(s)` : "0 Nights";
                                        })()}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-medium">
                                    <span>Total Amount</span>
                                    <span>₹{(() => {
                                        const room = rooms.find(r => r.id === selectedRoomId);
                                        if (!room) return 0;
                                        const start = new Date(bookingForm.checkIn);
                                        const end = new Date(bookingForm.checkOut);
                                        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                        return (nights > 0 ? nights : 1) * room.price;
                                    })()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Advance Paid</span>
                                    <span>- ₹{bookingForm.advancePayment || 0}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg text-primary">
                                    <span>To Pay</span>
                                    <span>₹{(() => {
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
                        )}
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </SheetClose>
                        <Button onClick={handleCreateBooking}>Confirm Check-In</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet >

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
