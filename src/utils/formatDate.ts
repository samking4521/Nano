 export const formatDate = (date: Date) => {
        const day = date.getDate();

        const getOrdinal = (n: number) => {
            if (n > 3 && n < 21) return `${n}th`;

            switch (n % 10) {
                case 1:
                    return `${n}st`;
                case 2:
                    return `${n}nd`;
                case 3:
                    return `${n}rd`;
                default:
                    return `${n}th`;
            }
        };

        const month = date.toLocaleString("en-US", {
            month: "short",
        });

        const year = date.getFullYear();

        return `${getOrdinal(day)} ${month}, ${year}`;
    };
