"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface SignatureCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onSignatureChange?: (value: string) => void
  width?: number
  height?: number
  isConfirmed?: boolean
  onConfirmChange?: (confirmed: boolean) => void
}

const isCanvasEmpty = (canvas: HTMLCanvasElement): boolean => {
  const context = canvas.getContext('2d')
  if (!context) return true
  
  const pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  )
  return !pixelBuffer.some(color => color !== 0)
}

export function SignatureCanvas({
  value,
  onSignatureChange,
  width = 400,
  height = 200,
  className,
  isConfirmed,
  onConfirmChange,
  ...props
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const [hasSignature, setHasSignature] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size and get context with willReadFrequently flag
    canvas.width = width
    canvas.height = height
    ctx.current = canvas.getContext('2d', { willReadFrequently: true })

    if (ctx.current) {
      ctx.current.lineWidth = 2
      ctx.current.lineCap = 'round'
      ctx.current.strokeStyle = '#000'
    }

    // Load existing signature if provided
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.current?.drawImage(img, 0, 0)
      }
      img.src = value
    }
  }, [width, height, value])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true
    draw(e)
  }

  const stopDrawing = () => {
    isDrawing.current = false
    ctx.current?.beginPath()
    
    if (canvasRef.current) {
      const isEmpty = isCanvasEmpty(canvasRef.current)
      setHasSignature(!isEmpty)
      
      if (onSignatureChange && !isEmpty) {
        onSignatureChange(canvasRef.current.toDataURL())
      }
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !ctx.current || !canvasRef.current) return

    e.preventDefault()
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    let x: number, y: number
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.current.lineTo(x, y)
    ctx.current.stroke()
    ctx.current.beginPath()
    ctx.current.moveTo(x, y)
  }

  const confirmSignature = () => {
    // Add debug logs

    if (!canvasRef.current) {
      console.log('No canvas reference')
      return
    }

    if (!onSignatureChange || !onConfirmChange) {
      console.log('Missing callback functions')
      return
    }

    const signatureData = canvasRef.current.toDataURL()
    console.log('Signature data length:', signatureData.length)
    
    onSignatureChange(signatureData)
    onConfirmChange(true)
    
    toast({
      title: "✓ Signature Confirmed",
      description: "Your signature has been captured successfully.",
      duration: 3000,
    })
  }

  const clearSignature = () => {
    if (!ctx.current || !canvasRef.current) return
    
    ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setHasSignature(false)
    if (onSignatureChange) {
      onSignatureChange('')
    }
    if (onConfirmChange) {
      onConfirmChange(false)
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)} {...props}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={cn(
            "border border-input rounded-md touch-none",
            isConfirmed && "opacity-50 pointer-events-none"
          )}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isConfirmed && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Signature Confirmed ✓
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={clearSignature}
        >
          Clear Signature
        </Button>
        <Button 
          type="button" 
          variant="default"
          onClick={confirmSignature}
          disabled={isConfirmed || !hasSignature}
          className={cn(
            "min-w-[140px]",
            isConfirmed ? "bg-green-600 hover:bg-green-700" : ""
          )}
        >
          {isConfirmed ? "Confirmed ✓" : "Confirm Signature"}
        </Button>
      </div>
      {!hasSignature && !isConfirmed && (
        <p className="text-sm text-muted-foreground">
          Please draw your signature
        </p>
      )}
    </div>
  )
}
