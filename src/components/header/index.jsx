import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { useTheme } from "../../ThemeProvider";

const Header = ({ title, breadcrumbs }) => {
  const theme = useTheme();
  const { palette } = theme.theme;

  return (
    <Box mb="10px" ml="14px">
      {title && (
        <Typography
          variant="h5"
          fontWeight="bold"
          style={{ color: palette.primary.main }}
          sx={{ mb: "2px" }}
        >
          {title}
        </Typography>
      )}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Typography>
          {breadcrumbs.map((breadcrumb, index) => (
            <span key={index}>
              <RouterLink
                to={breadcrumb.link}
                style={{ textDecoration: "none" }}
              >
                {breadcrumb.text}
              </RouterLink>
              {index < breadcrumbs.length - 1 && " / "}
            </span>
          ))}
        </Typography>
      )}
    </Box>
  );
};

export default Header;
