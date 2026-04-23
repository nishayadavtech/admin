import React from "react";
import { Card } from "react-bootstrap";

export default function AccessDenied() {
  return (
    <div className="container py-4">
      <Card
        style={{
          borderRadius: "14px",
          border: "none",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Card.Body className="text-center py-5">
          <h3 className="mb-2">Access Denied</h3>
          <p className="text-muted mb-0">
            Aapke role ko is module ka access assign nahi hai.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
