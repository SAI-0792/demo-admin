import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  modules: ("hotel" | "restaurant" | "travel")[]
  outlets: Outlet[]
  currentOutletId?: string
}

export interface Outlet {
  id: string
  name: string
  type: "hotel" | "restaurant" | "travel"
}

export interface HotelCategory {
  id: string
  name: string
  description: string
}

export interface Amenity {
  id: string
  name: string
  icon: string
}

export interface Room {
  id: string
  name: string
  categoryId: string
  price: number
  capacity: number
  amenities: string[] // amenity ids
  status: "available" | "occupied" | "maintenance"
  images: { id: string; url: string }[] // added images array and primaryImageId for multi-image support
  primaryImageId?: string
  description?: string
}

export interface Booking {
  id: string
  roomId: string
  guestName: string
  email: string
  phone: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: "pending" | "confirmed" | "checked-in" | "completed" | "cancelled"
  // POS & Extra Details
  guestCount?: number
  idProof?: string
  idProofImage?: string
  advancePayment?: number
  folioCharges?: {
    id: string
    date: string
    type: "laundry" | "room-service" | "restaurant" | "other"
    item: string
    quantity: number
    price: number
    total: number
  }[]
}

export interface RestaurantCategory {
  id: string
  name: string
  description: string
  image?: string // Added single image support for categories
}

export interface RestaurantSubCategory {
  id: string
  categoryId: string
  name: string
  description: string
  image?: string // Added single image support for subcategories
}

export interface ProductVariant {
  name: string
  sku?: string
  price: number
  discountPrice?: number
  stockCount: number
  isActive?: boolean
}

export interface MenuItem {
  id: string
  subCategoryId?: string // Deprecated but kept for compatibility
  categoryIds: string[]
  name: string
  description: string
  price: number
  discountPrice?: number
  dietaryType: "VEG" | "NON_VEG" | "VEGAN"
  images: { id: string; url: string; sequence?: number; isPrimary?: boolean }[]
  primaryImageId?: string
  isAvailable: boolean
  hasVariants?: boolean
  variants?: ProductVariant[]
}

export interface RestaurantOrder {
  id: string
  orderNumber: string
  items: { itemId: string; quantity: number }[]
  totalPrice: number
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
  customerName: string
  createdAt: string
}

export interface Vehicle {
  id: string
  type: "bus" | "car" | "van" | "truck"
  licensePlate: string
  capacity: number
  status: "active" | "maintenance" | "inactive"
  description: string
  driverId?: string // Added driver reference
  image?: string // Added vehicle image
  registrationExpiry?: string // Added registration expiry
  lastMaintenanceDate?: string // Added last maintenance date
}

export interface TravelContact {
  id: string
  name: string
  type: "client" | "driver" | "partner"
  email: string
  phone: string
  address: string
  vehicleIds?: string[] // Added vehicle associations for contacts
  image?: string // Added contact image
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  phone: string
  email: string
  licenseExpiry: string
  image?: string
}

interface HotelData {
  categories: HotelCategory[]
  amenities: Amenity[]
  rooms: Room[]
  bookings: Booking[]
}



interface HotelStore {
  hotelData: HotelData
  // Categories
  addCategory: (category: HotelCategory) => void
  updateCategory: (id: string, category: Partial<HotelCategory>) => void
  deleteCategory: (id: string) => void
  // Amenities
  addAmenity: (amenity: Amenity) => void
  updateAmenity: (id: string, amenity: Partial<Amenity>) => void
  deleteAmenity: (id: string) => void
  // Rooms
  addRoom: (room: Room) => void
  updateRoom: (id: string, room: Partial<Room>) => void
  deleteRoom: (id: string) => void
  // Bookings
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, booking: Partial<Booking>) => void
  deleteBooking: (id: string) => void
}

interface RestaurantData {
  categories: RestaurantCategory[]
  subCategories: RestaurantSubCategory[]
  menuItems: MenuItem[]
  orders: RestaurantOrder[]
}

interface TravelData {
  vehicles: Vehicle[]
  contacts: TravelContact[]
  drivers: Driver[] // Added drivers array
}

interface RestaurantStore {
  restaurantData: RestaurantData
  // Categories
  addCategory: (category: RestaurantCategory) => void
  updateCategory: (id: string, category: Partial<RestaurantCategory>) => void
  deleteCategory: (id: string) => void
  // Sub Categories
  addSubCategory: (subCategory: RestaurantSubCategory) => void
  updateSubCategory: (id: string, subCategory: Partial<RestaurantSubCategory>) => void
  deleteSubCategory: (id: string) => void
  // Menu Items
  addMenuItem: (menuItem: MenuItem) => void
  updateMenuItem: (id: string, menuItem: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  // Orders
  addOrder: (order: RestaurantOrder) => void
  updateOrder: (id: string, order: Partial<RestaurantOrder>) => void
  deleteOrder: (id: string) => void
}

interface TravelStore {
  travelData: TravelData
  // Vehicles
  addVehicle: (vehicle: Vehicle) => void
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void
  // Drivers
  addDriver: (driver: Driver) => void
  updateDriver: (id: string, driver: Partial<Driver>) => void
  deleteDriver: (id: string) => void
  // Contacts
  addContact: (contact: TravelContact) => void
  updateContact: (id: string, contact: Partial<TravelContact>) => void
  deleteContact: (id: string) => void
}

const MOCK_HOTEL_DATA: HotelData = {
  categories: [
    { id: "cat-1", name: "Deluxe Room", description: "Spacious room with premium amenities" },
    { id: "cat-2", name: "Standard Room", description: "Comfortable room with basic amenities" },
    { id: "cat-3", name: "Suite", description: "Luxury suite with separate living area" },
    { id: "cat-4", name: "Economy", description: "Budget-friendly room option" },
  ],
  amenities: [
    { id: "am-1", name: "WiFi", icon: "Wifi" },
    { id: "am-2", name: "Air Conditioning", icon: "Wind" },
    { id: "am-3", name: "TV", icon: "Tv" },
    { id: "am-4", name: "Mini Bar", icon: "Wine2" },
    { id: "am-5", name: "Gym", icon: "Dumbbell" },
    { id: "am-6", name: "Swimming Pool", icon: "Waves" },
  ],
  rooms: [
    {
      id: "room-1",
      name: "101",
      categoryId: "cat-1",
      price: 150,
      capacity: 2,
      amenities: ["am-1", "am-2", "am-3"],
      status: "available",
      images: [
        { id: "img-1", url: "/luxury-deluxe-room.jpg" },
        { id: "img-2", url: "/deluxe-bedroom-interior.jpg" },
      ],
      primaryImageId: "img-1",
    },
    {
      id: "room-2",
      name: "102",
      categoryId: "cat-1",
      price: 150,
      capacity: 2,
      amenities: ["am-1", "am-2", "am-3"],
      status: "occupied",
      images: [{ id: "img-3", url: "/deluxe-hotel-room.png" }],
      primaryImageId: "img-3",
    },
    {
      id: "room-3",
      name: "201",
      categoryId: "cat-2",
      price: 100,
      capacity: 2,
      amenities: ["am-1", "am-2"],
      status: "available",
      images: [{ id: "img-4", url: "/standard-hotel-room.png" }],
      primaryImageId: "img-4",
    },
    {
      id: "room-4",
      name: "202",
      categoryId: "cat-2",
      price: 100,
      capacity: 2,
      amenities: ["am-1", "am-2"],
      status: "available",
      images: [{ id: "img-5", url: "/comfortable-bedroom.png" }],
      primaryImageId: "img-5",
    },
    {
      id: "room-5",
      name: "301",
      categoryId: "cat-3",
      price: 250,
      capacity: 4,
      amenities: ["am-1", "am-2", "am-3", "am-4"],
      status: "occupied",
      images: [
        { id: "img-6", url: "/luxury-suite-hotel.jpg" },
        { id: "img-7", url: "/luxurious-suite-living-room.png" },
      ],
      primaryImageId: "img-6",
    },
    {
      id: "room-6",
      name: "302",
      categoryId: "cat-3",
      price: 250,
      capacity: 4,
      amenities: ["am-1", "am-2", "am-3", "am-4"],
      status: "maintenance",
      images: [{ id: "img-8", url: "/premium-suite-room.jpg" }],
      primaryImageId: "img-8",
    },
  ],
  bookings: [
    {
      id: "book-1",
      roomId: "room-1",
      guestName: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      checkIn: "2024-11-15",
      checkOut: "2024-11-17",
      totalPrice: 300,
      status: "confirmed",
    },
    {
      id: "book-2",
      roomId: "room-2",
      guestName: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567891",
      checkIn: "2024-11-10",
      checkOut: "2024-11-13",
      totalPrice: 450,
      status: "checked-in",
    },
    {
      id: "book-3",
      roomId: "room-5",
      guestName: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1234567892",
      checkIn: "2024-11-12",
      checkOut: "2024-11-14",
      totalPrice: 500,
      status: "checked-in",
    },
  ],
}

const MOCK_RESTAURANT_DATA: RestaurantData = {
  categories: [
    { id: "rcat-1", name: "Appetizers", description: "Starters and appetizers" },
    { id: "rcat-2", name: "Main Course", description: "Main dishes" },
    { id: "rcat-3", name: "Desserts", description: "Desserts and sweets" },
    { id: "rcat-4", name: "Beverages", description: "Drinks and beverages" },
  ],
  subCategories: [
    { id: "rsubcat-1", categoryId: "rcat-1", name: "Cold Appetizers", description: "Chilled starters" },
    { id: "rsubcat-2", categoryId: "rcat-1", name: "Hot Appetizers", description: "Warm starters" },
    { id: "rsubcat-3", categoryId: "rcat-2", name: "Seafood", description: "Fish and seafood dishes" },
    { id: "rsubcat-4", categoryId: "rcat-2", name: "Meat", description: "Meat-based dishes" },
    { id: "rsubcat-5", categoryId: "rcat-3", name: "Cakes", description: "Cake varieties" },
    { id: "rsubcat-6", categoryId: "rcat-4", name: "Hot Drinks", description: "Coffee and tea" },
  ],
  menuItems: [
    {
      id: "ritem-1",
      subCategoryId: "rsubcat-1",
      categoryIds: ["rcat-1"],
      name: "Caesar Salad",
      description: "Classic Caesar with croutons",
      price: 8.99,
      dietaryType: "VEG",
      images: [{ id: "rimg-1", url: "/caesar-salad.jpg" }],
      primaryImageId: "rimg-1",
      isAvailable: true,
    },
    {
      id: "ritem-2",
      subCategoryId: "rsubcat-2",
      categoryIds: ["rcat-1"],
      name: "Garlic Bread",
      description: "Crispy garlic bread",
      price: 5.99,
      dietaryType: "VEG",
      images: [{ id: "rimg-2", url: "/garlic-bread.jpg" }],
      primaryImageId: "rimg-2",
      isAvailable: true,
    },
    {
      id: "ritem-3",
      subCategoryId: "rsubcat-3",
      categoryIds: ["rcat-2"],
      name: "Grilled Salmon",
      description: "Fresh grilled salmon",
      price: 16.99,
      dietaryType: "NON_VEG",
      images: [{ id: "rimg-3", url: "/grilled-salmon.jpg" }],
      primaryImageId: "rimg-3",
      isAvailable: true,
    },
    {
      id: "ritem-4",
      subCategoryId: "rsubcat-4",
      categoryIds: ["rcat-2"],
      name: "Ribeye Steak",
      description: "Premium ribeye steak",
      price: 24.99,
      dietaryType: "NON_VEG",
      images: [{ id: "rimg-4", url: "/ribeye-steak.jpg" }],
      primaryImageId: "rimg-4",
      isAvailable: true,
    },
    {
      id: "ritem-5",
      subCategoryId: "rsubcat-5",
      categoryIds: ["rcat-3"],
      name: "Chocolate Cake",
      description: "Rich chocolate cake",
      price: 6.99,
      dietaryType: "NON_VEG",
      images: [{ id: "rimg-5", url: "/chocolate-cake.jpg" }],
      primaryImageId: "rimg-5",
      isAvailable: true,
    },
    {
      id: "ritem-6",
      subCategoryId: "rsubcat-6",
      categoryIds: ["rcat-4"],
      name: "Espresso",
      description: "Strong Italian espresso",
      price: 3.99,
      dietaryType: "VEGAN",
      images: [{ id: "rimg-6", url: "/espresso.jpg" }],
      primaryImageId: "rimg-6",
      isAvailable: true,
    },
  ],
  orders: [
    {
      id: "order-1",
      orderNumber: "ORD001",
      items: [
        { itemId: "ritem-1", quantity: 2 },
        { itemId: "ritem-2", quantity: 1 },
      ],
      totalPrice: 22.97,
      status: "delivered",
      customerName: "Alice Johnson",
      createdAt: "2024-11-10",
    },
    {
      id: "order-2",
      orderNumber: "ORD002",
      items: [{ itemId: "ritem-3", quantity: 1 }],
      totalPrice: 16.99,
      status: "preparing",
      customerName: "Bob Smith",
      createdAt: "2024-11-11",
    },
    {
      id: "order-3",
      orderNumber: "ORD003",
      items: [
        { itemId: "ritem-4", quantity: 2 },
        { itemId: "ritem-5", quantity: 1 },
      ],
      totalPrice: 56.97,
      status: "ready",
      customerName: "Carol White",
      createdAt: "2024-11-11",
    },
  ],
}

const MOCK_TRAVEL_DATA: TravelData = {
  drivers: [
    {
      id: "driver-1",
      name: "John Driver",
      licenseNumber: "DL123456",
      phone: "+1234567890",
      email: "john@example.com",
      licenseExpiry: "2025-12-31",
      image: "/driver-john.jpg",
    },
    {
      id: "driver-2",
      name: "Sarah Pilot",
      licenseNumber: "DL789012",
      phone: "+1234567891",
      email: "sarah@example.com",
      licenseExpiry: "2025-06-30",
      image: "/driver-sarah.jpg",
    },
    {
      id: "driver-3",
      name: "Mike Transport",
      licenseNumber: "DL345678",
      phone: "+1234567892",
      email: "mike@example.com",
      licenseExpiry: "2026-03-15",
      image: "/driver-mike.jpg",
    },
  ],
  vehicles: [
    {
      id: "veh-1",
      type: "bus",
      licensePlate: "BUS-001",
      capacity: 50,
      status: "active",
      description: "Long distance bus",
      driverId: "driver-1",
      image: "/bus-001.jpg",
      registrationExpiry: "2026-06-30",
      lastMaintenanceDate: "2024-10-15",
    },
    {
      id: "veh-2",
      type: "car",
      licensePlate: "CAR-001",
      capacity: 4,
      status: "active",
      description: "Executive sedan",
      driverId: "driver-2",
      image: "/car-001.jpg",
      registrationExpiry: "2025-12-31",
      lastMaintenanceDate: "2024-11-01",
    },
    {
      id: "veh-3",
      type: "van",
      licensePlate: "VAN-001",
      capacity: 12,
      status: "maintenance",
      description: "Passenger van",
      driverId: "driver-3",
      image: "/van-001.jpg",
      registrationExpiry: "2025-09-15",
      lastMaintenanceDate: "2024-10-20",
    },
    {
      id: "veh-4",
      type: "truck",
      licensePlate: "TRK-001",
      capacity: 2,
      status: "active",
      description: "Cargo truck",
      image: "/truck-001.jpg",
      registrationExpiry: "2026-03-31",
      lastMaintenanceDate: "2024-11-05",
    },
  ],
  contacts: [
    {
      id: "tc-1",
      name: "John Driver",
      type: "driver",
      email: "john@example.com",
      phone: "+1234567890",
      address: "123 Main St",
      vehicleIds: ["veh-1"],
      image: "/contact-john.jpg",
    },
    {
      id: "tc-2",
      name: "Sarah Client",
      type: "client",
      email: "sarah@example.com",
      phone: "+1234567891",
      address: "456 Oak Ave",
      vehicleIds: ["veh-1", "veh-2"],
      image: "/contact-sarah.jpg",
    },
    {
      id: "tc-3",
      name: "Mike Partner",
      type: "partner",
      email: "mike@example.com",
      phone: "+1234567892",
      address: "789 Pine Rd",
      vehicleIds: ["veh-3"],
      image: "/contact-mike.jpg",
    },
  ],
}

// Re-export AuthStore from new location
export { useAuthStore } from "@/core/store/use-auth-store"

export const useHotelStore = create<HotelStore>()(
  persist(
    (set) => ({
      hotelData: MOCK_HOTEL_DATA,

      addCategory: (category) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            categories: [...state.hotelData.categories, category],
          },
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            categories: state.hotelData.categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
          },
        })),

      deleteCategory: (id) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            categories: state.hotelData.categories.filter((cat) => cat.id !== id),
          },
        })),

      addAmenity: (amenity) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            amenities: [...state.hotelData.amenities, amenity],
          },
        })),

      updateAmenity: (id, updates) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            amenities: state.hotelData.amenities.map((am) => (am.id === id ? { ...am, ...updates } : am)),
          },
        })),

      deleteAmenity: (id) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            amenities: state.hotelData.amenities.filter((am) => am.id !== id),
          },
        })),

      addRoom: (room) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            rooms: [...state.hotelData.rooms, room],
          },
        })),

      updateRoom: (id, updates) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            rooms: state.hotelData.rooms.map((room) => (room.id === id ? { ...room, ...updates } : room)),
          },
        })),

      deleteRoom: (id) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            rooms: state.hotelData.rooms.filter((room) => room.id !== id),
          },
        })),

      addBooking: (booking) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            bookings: [...state.hotelData.bookings, booking],
          },
        })),

      updateBooking: (id, updates) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            bookings: state.hotelData.bookings.map((booking) => (booking.id === id ? { ...booking, ...updates } : booking)),
          },
        })),

      deleteBooking: (id) =>
        set((state) => ({
          hotelData: {
            ...state.hotelData,
            bookings: state.hotelData.bookings.filter((booking) => booking.id !== id),
          },
        })),
    }),
    {
      name: 'hotel-storage', // unique name for localStorage key
    }
  )
)

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  restaurantData: MOCK_RESTAURANT_DATA,

  addCategory: (category) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        categories: [...state.restaurantData.categories, category],
      },
    })),

  updateCategory: (id, updates) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        categories: state.restaurantData.categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
      },
    })),

  deleteCategory: (id) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        categories: state.restaurantData.categories.filter((cat) => cat.id !== id),
      },
    })),

  addSubCategory: (subCategory) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        subCategories: [...state.restaurantData.subCategories, subCategory],
      },
    })),

  updateSubCategory: (id, updates) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        subCategories: state.restaurantData.subCategories.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)),
      },
    })),

  deleteSubCategory: (id) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        subCategories: state.restaurantData.subCategories.filter((sub) => sub.id !== id),
      },
    })),

  addMenuItem: (menuItem) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        menuItems: [...state.restaurantData.menuItems, menuItem],
      },
    })),

  updateMenuItem: (id, updates) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        menuItems: state.restaurantData.menuItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      },
    })),

  deleteMenuItem: (id) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        menuItems: state.restaurantData.menuItems.filter((item) => item.id !== id),
      },
    })),

  addOrder: (order) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        orders: [...state.restaurantData.orders, order],
      },
    })),

  updateOrder: (id, updates) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        orders: state.restaurantData.orders.map((order) => (order.id === id ? { ...order, ...updates } : order)),
      },
    })),

  deleteOrder: (id) =>
    set((state) => ({
      restaurantData: {
        ...state.restaurantData,
        orders: state.restaurantData.orders.filter((order) => order.id !== id),
      },
    })),
}))

export const useTravelStore = create<TravelStore>((set) => ({
  travelData: MOCK_TRAVEL_DATA,

  addVehicle: (vehicle) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        vehicles: [...state.travelData.vehicles, vehicle],
      },
    })),

  updateVehicle: (id, updates) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        vehicles: state.travelData.vehicles.map((veh) => (veh.id === id ? { ...veh, ...updates } : veh)),
      },
    })),

  deleteVehicle: (id) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        vehicles: state.travelData.vehicles.filter((veh) => veh.id !== id),
      },
    })),

  addDriver: (driver) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        drivers: [...state.travelData.drivers, driver],
      },
    })),

  updateDriver: (id, updates) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        drivers: state.travelData.drivers.map((drv) => (drv.id === id ? { ...drv, ...updates } : drv)),
      },
    })),

  deleteDriver: (id) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        drivers: state.travelData.drivers.filter((drv) => drv.id !== id),
      },
    })),

  addContact: (contact) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        contacts: [...state.travelData.contacts, contact],
      },
    })),

  updateContact: (id, updates) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        contacts: state.travelData.contacts.map((con) => (con.id === id ? { ...con, ...updates } : con)),
      },
    })),

  deleteContact: (id) =>
    set((state) => ({
      travelData: {
        ...state.travelData,
        contacts: state.travelData.contacts.filter((con) => con.id !== id),
      },
    })),
}))
