export default function ListingList({ listings, onDelete }) {
  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
      {listings.map((l) => (
        <div key={l.id} style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {l.imageUrl ? (
              <img src={l.imageUrl} alt={l.title} style={{ width: 100, height: 100, objectFit: 'cover' }} />
            ) : null}
            <div>
              <h3 style={{ margin: 0 }}>{l.title}</h3>
              <div>{l.description}</div>
              <div>Category: {l.category} | Condition: {l.condition} | Price: {l.price}</div>
              {l.groupMeLink && (
                <div><a href={l.groupMeLink} target="_blank" rel="noreferrer">GroupMe</a></div>
              )}
            </div>
          </div>
          {onDelete && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => onDelete(l.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


