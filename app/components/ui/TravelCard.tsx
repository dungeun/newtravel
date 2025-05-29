import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';

interface TravelCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  duration: string;
  rating?: number;
  hasTimeSale?: boolean;
  isConfirmed?: boolean;
  onClick?: () => void;
}

export const TravelCard = ({
  id,
  title,
  image,
  price,
  location,
  duration,
  rating = 0,
  hasTimeSale = false,
  isConfirmed = false,
  onClick
}: TravelCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative w-full h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
        {hasTimeSale && (
          <Badge variant="teal" className="absolute top-2 left-2">
            타임세일
          </Badge>
        )}
        {isConfirmed && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            출발확정
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{location}</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{duration}</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-2 flex items-center justify-between">
        <div className="text-lg font-bold text-primary">
          {price.toLocaleString()}원
        </div>
        <Button 
          variant="teal" 
          size="sm" 
          onClick={onClick}
        >
          상세보기
        </Button>
      </CardFooter>
    </Card>
  );
}; 