import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import type { Player, UserProfile } from "../types";
import { s } from "../styles";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize",
  "Benin","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile","China",
  "Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Ethiopia","Finland",
  "France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Latvia","Lebanon",
  "Libya","Lithuania","Luxembourg","Malaysia","Mali","Malta","Mexico","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Nepal",
  "Netherlands","New Zealand","Nicaragua","Nigeria","North Korea","Norway","Oman",
  "Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Singapore",
  "Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka",
  "Sudan","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
  "Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam",
  "Yemen","Zambia","Zimbabwe",
];

const GENDERS = [
  { value: "male", label: "Hombre" },
  { value: "female", label: "Mujer" },
  { value: "nb", label: "No binario" },
];

interface ProfilePanelProps {
  player1: Player;
  selectedProfile: UserProfile | null;
  onClearProfile: () => void;
  onLogout: () => void;
  onUpdateProfile: (data: any) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
}

export default function ProfilePanel({
  player1,
  selectedProfile,
  onClearProfile,
  onLogout,
  onUpdateProfile,
}: ProfilePanelProps) {
  const profileData = selectedProfile ?? player1;

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    country: "",
    gender: "",
    birthDate: null as Date | null,
    avatarUrl: "",
  });

  useEffect(() => {
    const data = selectedProfile ?? player1;

    setForm({
      displayName: data.displayName ?? "",
      country: data.country ?? "",
      gender: data.gender ?? "",
      birthDate: data.birthDate
        ? new Date(data.birthDate)
        : null,
      avatarUrl: data.avatarUrl ?? "",
    });
  }, [player1, selectedProfile]);

  const saveProfile = async () => {
    await onUpdateProfile({
      ...form,
      birthDate: form.birthDate
        ? form.birthDate.toISOString().split("T")[0]
        : null,
    });

    setEditing(false);
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/user/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${player1.token}`,
      },
      body: formData,
    });

    const data = await res.json();

    setForm((prev) => ({
      ...prev,
      avatarUrl: data.avatarUrl,
    }));

    await onUpdateProfile({
      avatarUrl: data.avatarUrl,
    });
  };

  const ownFields: [string, React.ReactNode][] = [
    [
      "VICTORIAS",
      <span style={{ color: "#4ecdc4", fontWeight: 700 }}>
        {player1.wins ?? 0}
      </span>,
    ],
    ["EMAIL", player1.email || "—"],
    ["PAÍS", player1.country || "—"],
    ["GÉNERO", player1.gender || "—"],
    [
      "CUMPLEAÑOS",
      player1.birthDate
        ? new Date(player1.birthDate).toLocaleDateString()
        : "—",
    ],
  ];

  const otherFields: [string, React.ReactNode][] = selectedProfile
    ? [
        [
          "VICTORIAS",
          <span style={{ color: "#4ecdc4", fontWeight: 700 }}>
            {selectedProfile.wins ?? 0}
          </span>,
        ],
        ["PAÍS", selectedProfile.country || "—"],
        ["GÉNERO", selectedProfile.gender || "—"],
        [
          "CUMPLEAÑOS",
          selectedProfile.birthDate
            ? new Date(selectedProfile.birthDate).toLocaleDateString()
            : "—",
        ],
      ]
    : [];

  const fields = selectedProfile ? otherFields : ownFields;

  return (
    <div
      style={{
        flex: "0 0 24%",
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: 8,
        padding: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span style={{ color: "#fff", fontSize: 26 }}>
                {profileData.username[0].toUpperCase()}
              </span>
            )}
          </div>

          {!selectedProfile && (
            <input
              type="file"
              accept="image/*"
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
              }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
          )}
        </div>

        <div>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: "bold",
              letterSpacing: 1,
              color: selectedProfile ? "#4ecdc4" : "#fff",
            }}
          >
            {profileData.displayName || profileData.username}
          </p>

          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "#555",
              letterSpacing: 1,
            }}
          >
            @{profileData.username}
          </p>
        </div>
      </div>

      {/* Fields */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {fields.map(([label, value]) => (
          <div key={label}>
            <p style={s.profileLabel}>{label}</p>
            <p style={{ ...s.profileValue, margin: 0 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Edit button */}
      {!selectedProfile && !editing && (
        <button
          onClick={() => setEditing(true)}
          style={{
            ...s.btnSmall,
            marginTop: 16,
            width: "100%",
          }}
        >
          Editar perfil
        </button>
      )}

      {/* Edit form */}
      {!selectedProfile && editing && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 16,
          }}
        >
          <input
            style={s.input}
            placeholder="Display name"
            value={form.displayName}
            onChange={(e) =>
              setForm({
                ...form,
                displayName: e.target.value,
              })
            }
          />

          <select
            style={s.input}
            value={form.country}
            onChange={(e) =>
              setForm({
                ...form,
                country: e.target.value,
              })
            }
          >
            <option value="">— Selecciona un país —</option>

            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            style={s.input}
            value={form.gender}
            onChange={(e) =>
              setForm({
                ...form,
                gender: e.target.value,
              })
            }
          >
            <option value="">— Selecciona —</option>

            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>

          <DatePicker
            selected={form.birthDate}
            onChange={(date: Date | null) =>
              setForm({
                ...form,
                birthDate: date,
              })
            }
            dateFormat="dd/MM/yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            minDate={new Date("1940-01-01")}
            maxDate={new Date()}
            placeholderText="Fecha de nacimiento"
            className="custom-datepicker"
          />

          <button
            style={{
              ...s.btn,
              ...s.btnPrimary,
            }}
            onClick={saveProfile}
          >
            Guardar
          </button>

          <button
            style={s.btnLink}
            onClick={() => setEditing(false)}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {selectedProfile ? (
          <button
            style={s.btnLink}
            onClick={onClearProfile}
          >
            ← Mi perfil
          </button>
        ) : (
          <button
            style={s.btnLink}
            onClick={onLogout}
          >
            ← Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
}