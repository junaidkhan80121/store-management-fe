import React, { useState } from 'react';
import { Box, Typography, Tooltip, Zoom } from '@mui/material';

interface ChamberVisualizerProps {
  totalCapacity: number;
  usedCapacity: number;
  capacityType: string;
  onChangeCapacity?: (newCapacity: number) => void;
}

export default function ChamberVisualizer({ totalCapacity, usedCapacity, capacityType, onChangeCapacity }: ChamberVisualizerProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // If total capacity is small enough, show 1:1 mapping (like movie seats)
  // If it's very large, break it down into 100 percentage blocks to avoid crashing the browser
  const isLargeCapacity = totalCapacity > 200;
  
  const totalSlots = isLargeCapacity ? 100 : totalCapacity;
  const occupiedSlots = isLargeCapacity && totalCapacity > 0
    ? Math.round((usedCapacity / totalCapacity) * 100) 
    : usedCapacity;
    
  const slots = Array.from({ length: totalSlots }, (_, i) => ({
    id: i,
    isOccupied: i < occupiedSlots,
    label: isLargeCapacity 
      ? `Block ${i + 1} (~${Math.ceil(totalCapacity / 100)} ${capacityType})`
      : `Slot ${i + 1} (${capacityType})`
  }));

  const handleSlotClick = (slotId: number, isOccupied: boolean) => {
    if (!onChangeCapacity) return;
    
    let newUsedCapacity;
    if (isLargeCapacity) {
      const percent = isOccupied ? slotId : slotId + 1;
      newUsedCapacity = Math.round((percent / 100) * totalCapacity);
    } else {
      newUsedCapacity = isOccupied ? slotId : slotId + 1;
    }
    onChangeCapacity(newUsedCapacity);
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
        <span>Capacity Visualization</span>
        {totalCapacity > 0 && (
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'text.secondary' }}>
            {isLargeCapacity ? 'Showing 1% blocks' : 'Showing individual slots'}
          </span>
        )}
      </Typography>
      
      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: 'primary.main', opacity: 0.8 }} />
          <Typography variant="body2" color="text.secondary">Occupied</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }} />
          <Typography variant="body2" color="text.secondary">Available</Typography>
        </Box>
      </Box>

      {/* Grid */}
      {totalCapacity <= 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, bgcolor: 'background.default', borderRadius: 2 }}>
          Total capacity is 0. Please update the total capacity to visualize slots.
        </Typography>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))', 
          gap: 1,
          maxHeight: 400,
          overflowY: 'auto',
          p: 1,
          bgcolor: 'background.default',
          borderRadius: 2
        }}>
          {slots.map((slot) => (
            <Tooltip 
              key={slot.id} 
              title={`${slot.label} - ${slot.isOccupied ? 'Occupied (Click to free)' : 'Available (Click to fill)'}`}
              slots={{ transition: Zoom }}
              arrow
            >
              <Box
                onMouseEnter={() => setHoveredSlot(slot.id)}
                onMouseLeave={() => setHoveredSlot(null)}
                onClick={() => handleSlotClick(slot.id, slot.isOccupied)}
                sx={{
                  aspectRatio: '1',
                  borderRadius: 1,
                  bgcolor: slot.isOccupied ? 'primary.main' : 'background.paper',
                  border: '1px solid',
                  borderColor: slot.isOccupied ? 'primary.dark' : 'divider',
                  opacity: slot.isOccupied ? 0.85 : 0.6,
                  cursor: onChangeCapacity ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  transform: hoveredSlot === slot.id ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: hoveredSlot === slot.id ? 2 : 0,
                  zIndex: hoveredSlot === slot.id ? 1 : 0,
                  position: 'relative'
                }}
              />
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
}
