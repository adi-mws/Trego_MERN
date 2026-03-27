import { Box, Chip, Typography, Button } from '@mui/material'
import React from 'react'

export default function PricingOffer({ }) {
    return (
        <Box sx={{
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            py: 1,
            gap: 2,
            bgcolor: 'primary.main',
            alignItems: "center",
            fontSize: 12
        }}>
            <Chip variant="filled" label="LIMITED OFFER" sx={{ bgcolor: "white", fontSize: "inherit", fontWeight: 700, color: "primary.main" }} />
            <Typography variant="body2" fontSize={"inherit"} color='white' sx={{ fontWeight: 600 }}>All Plans</Typography>
            <Chip
                label="30% Off"
                sx={{
                    fontWeight: 600,
                    fontSize: "inherit",
                    color: "#fff",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    px: 1.5,
                    py: 2,
                }}
            />
            <Typography variant="body2" fontSize={"inherit"} color='white' sx={{ fontWeight: 600 }}>For Next 7 Days</Typography>
            <Button
                variant="contained"
                onClick={() => {
                    // your action here
                }}
                sx={{
                    fontSize: "inherit",
                    fontVariant: "body2",
                    fontWeight: 600,
                    color: "#fff",
                    textTransform: "none",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    borderRadius: 999,
                    px:3,
                    py: 0.75,
                    "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.2)",
                    },

                    "&:active": {
                        transform: "scale(0.98)",
                    },
                }}
            >
                Claim Now
            </Button>


        </Box>
    )
}