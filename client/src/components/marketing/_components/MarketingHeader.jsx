import {
    AppBar,
    Box,
    Button,
    Container,
    Toolbar,
    Typography,
    Stack,
} from "@mui/material";
import PricingOffer from "./PricingOffer";
import { Link, useNavigate } from "react-router-dom";
export default function MarketingHeader() {
    const navigate = useNavigate();

    return (
        <>  
        <Box sx={{height: 100}}/>

            <Box sx={{position: 'fixed', top: 0, left: 0, right: 0, background: 'white', zIndex: 1100, }}>
                {/* Top Pricing / Promo Bar */}
                <PricingOffer />

                {/* Main Header */}
                <AppBar
                    position="static"
                    elevation={0}
                    color="transparent"
                    sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Container maxWidth="lg">
                        <Toolbar disableGutters sx={{ minHeight: 72 }}>
                            {/* Logo (Left) */}
                            <Box
                                component="img"
                                src="/images/logo-with-text.png"
                                alt="Logo"
                                sx={{ width: 100 }}
                            />

                            {/* Spacer to push everything right */}
                            <Box sx={{ flexGrow: 1 }} />

                            {/* Right Side: Nav + Actions */}
                            <Stack
                                direction="row"
                                spacing={6}
                                alignItems="center"
                                sx={{
                                    display: { xs: "none", md: "flex" },
                                }}
                            >
                                {/* Navigation */}
                                <Stack direction="row" spacing={5}>
                                    <NavItem label="Home" link="/" />
                                    <NavItem label="About" link="/about" />
                                    <NavItem label="Pricing" link="/pricing" />
                                    <NavItem label="Support" link="/support" />
                                    <NavItem label="Contact" link="/contact" />
                                </Stack>

                                {/* Actions */}
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        color="inherit"
                                        variant="outlined"
                                        onClick={() => navigate("/sign-in")}
                                        sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                                    >
                                        Sign In
                                    </Button>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                        onClick={() => navigate("/sign-up")}
                                    >
                                        Sign Up
                                    </Button>
                                </Stack>
                            </Stack>
                        </Toolbar>
                    </Container>

                </AppBar>
            </Box>
        </>
    );
}

function NavItem({
    label,
    link,
}) {
    return (
        <Typography
            component={Link}
            href={link}
            variant="body2"
            sx={{
                fontWeight: 600,
                cursor: "pointer",
                color: "text.secondary",
                textDecoration: "none",
                transition: "color 0.2s ease",
                "&:hover": {
                    color: "text.primary",
                },
            }}
        >
            {label}
        </Typography>
    );
}

