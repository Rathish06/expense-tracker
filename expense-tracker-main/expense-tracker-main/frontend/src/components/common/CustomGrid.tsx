import React from 'react';
import { Grid } from '@mui/material';
import type { GridProps } from '@mui/material/Grid';

interface CustomGridProps extends GridProps {
  item?: boolean;
  container?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
}

const CustomGrid: React.FC<CustomGridProps> = (props) => {
  return <Grid {...props} />;
};

export default CustomGrid; 