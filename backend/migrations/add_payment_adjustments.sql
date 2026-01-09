-- Create payment_adjustments table
CREATE TABLE IF NOT EXISTS payment_adjustments (
  id SERIAL PRIMARY KEY,
  "bookingId" INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  "requestedBy" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  "respondedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_adjustments_booking ON payment_adjustments("bookingId");
CREATE INDEX IF NOT EXISTS idx_payment_adjustments_status ON payment_adjustments(status);

-- Add trigger to update updatedAt
CREATE OR REPLACE FUNCTION update_payment_adjustments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_adjustments_updated_at_trigger
BEFORE UPDATE ON payment_adjustments
FOR EACH ROW
EXECUTE FUNCTION update_payment_adjustments_updated_at();
