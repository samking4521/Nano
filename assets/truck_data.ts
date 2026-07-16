import { ImageSourcePropType } from "react-native";

export type vehicleType = "Pickup Truck" | "Flatbed Truck" | "Tipper Truck" | "Box Truck" | "Van Truck" | "Container Truck" | "";

export type vehicleDataType = {
    image: ImageSourcePropType,
    name: vehicleType,
}

export const vehicleTypeData: vehicleDataType[] = [
    {
        image: require("../assets/truck_types/pickup_truck.png"),
        name: "Pickup Truck",
    },
    {
        image: require("../assets/truck_types/flatbed_truck.png"),
        name: "Flatbed Truck",

    },
    {
        image: require("../assets/truck_types/tipper_truck.png"),
        name: "Tipper Truck",

    },
    {
        image: require("../assets/truck_types/box_truck.png"),
        name: "Box Truck",

    },
    {
        image: require("../assets/truck_types/van_truck.png"),
        name: "Van Truck",

    },
    {
        image: require("../assets/truck_types/container_truck.png"),
        name: "Container Truck",

    }
]