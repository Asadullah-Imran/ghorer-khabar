"use client";

import Image from "next/image";
import { MenuItem, Ingredient } from "@/lib/dummy-data/chef";
import { X, Plus, Trash2, Upload, X as CloseIcon } from "lucide-react";
import { useState, useRef } from "react";

interface MenuItemFormProps {
  item?: MenuItem;
  onClose: () => void;
  onSave: (item: Partial<MenuItem>) => void;
}

export default function MenuItemForm({ item, onClose, onSave }: MenuItemFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    category: item?.category || "Rice",
    currentPrice: item?.currentPrice || 100,
    marketPriceMin: item?.marketPriceRange.min || 80,
    marketPriceMax: item?.marketPriceRange.max || 500,
    prepTime: item?.prepTime || 30,
    spiciness: item?.spiciness || "Medium",
    isVegetarian: item?.isVegetarian || false,
    allergens: item?.allergens?.join(", ") || "",
    image: item?.image || "",
  });

  const [uploadedImages, setUploadedImages] = useState<
    Array<{ id: string; file: File; preview: string }>
  >(
    item?.image
      ? [
          {
            id: "existing",
            file: new File([], "existing"),
            preview: item.image,
          },
        ]
      : []
  );

  const [ingredients, setIngredients] = useState<Ingredient[]>(
    item?.ingredients || []
  );

  const [useCustomPrice, setUseCustomPrice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the first uploaded image as the primary image, or the preview if it exists
    const primaryImage =
      uploadedImages.length > 0 ? uploadedImages[0].preview : formData.image;

    onSave({
      id: item?.id || Date.now().toString(),
      ...formData,
      image: primaryImage,
      marketPriceRange: {
        min: formData.marketPriceMin,
        max: formData.marketPriceMax,
      },
      allergens: formData.allergens
        ? formData.allergens.split(",").map((a) => a.trim())
        : [],
      ingredients: ingredients,
      isAvailable: true,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newImages = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }));

    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image && image.preview.startsWith("blob:")) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", quantity: "", unit: "grams", cost: 0 },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const totalIngredientCost = ingredients.reduce((sum, ing) => sum + (ing.cost || 0), 0);
  const profitMargin = formData.currentPrice - totalIngredientCost;
  const profitMarginPercent =
    totalIngredientCost > 0
      ? Math.round((profitMargin / formData.currentPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {item ? "Edit Menu Item" : "Add New Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Dish Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Shorshe Ilish"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              rows={3}
              placeholder="Brief description of the dish"
            />
          </div>

          {/* Category & Prep Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="Rice">Rice</option>
                <option value="Beef">Beef</option>
                <option value="Chicken">Chicken</option>
                <option value="Fish">Fish</option>
                <option value="Vegetarian">Vegetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Prep Time (mins)
              </label>
              <input
                type="number"
                value={formData.prepTime}
                onChange={(e) =>
                  setFormData({ ...formData, prepTime: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min="10"
              />
            </div>
          </div>

          {/* Price Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-900">
                Pricing
              </label>
              <button
                type="button"
                onClick={() => setUseCustomPrice(!useCustomPrice)}
                className="text-xs text-teal-600 font-medium hover:underline"
              >
                {useCustomPrice ? "Use Market Slider" : "Set Custom Price"}
              </button>
            </div>

            {!useCustomPrice ? (
              <>
                {/* Price Slider */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Market Price Range</span>
                    <span className="text-lg font-bold text-teal-700">
                      ৳{formData.currentPrice}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={formData.marketPriceMin}
                    max={formData.marketPriceMax}
                    value={formData.currentPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPrice: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Min: ৳{formData.marketPriceMin}</span>
                    <span>Max: ৳{formData.marketPriceMax}</span>
                  </div>
                </div>

                {/* Market Range Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Market Min
                    </label>
                    <input
                      type="number"
                      value={formData.marketPriceMin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marketPriceMin: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Market Max
                    </label>
                    <input
                      type="number"
                      value={formData.marketPriceMax}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marketPriceMax: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Custom Price
                </label>
                <input
                  type="number"
                  value={formData.currentPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPrice: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter custom price"
                />
              </div>
            )}
          </div>

          {/* Spiciness & Vegetarian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Spiciness
              </label>
              <select
                value={formData.spiciness}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spiciness: e.target.value as "Mild" | "Medium" | "High",
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) =>
                    setFormData({ ...formData, isVegetarian: e.target.checked })
                  }
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm font-semibold text-gray-900">
                  Vegetarian
                </span>
              </label>
            </div>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Allergens (comma-separated)
            </label>
            <input
              type="text"
              value={formData.allergens}
              onChange={(e) =>
                setFormData({ ...formData, allergens: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Fish, Mustard, Nuts"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Dish Images (optional)
            </label>

            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                dragActive
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-300 bg-gray-50 hover:border-teal-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <Upload className="mx-auto mb-2 text-teal-600" size={32} />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Drag and drop images here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-3">
                  {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""} selected
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group rounded-lg overflow-hidden border-2 border-gray-200 aspect-square"
                    >
                      <Image
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        title="Remove image"
                      >
                        <CloseIcon size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  The first image will be used as the primary dish image
                </p>
              </div>
            )}
          </div>

          {/* Ingredients Section */}
          <div className="border border-teal-200 rounded-lg p-4 bg-teal-50">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-900">
                Ingredients & Costs
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 text-sm text-teal-600 font-medium hover:text-teal-700"
              >
                <Plus size={16} />
                Add Ingredient
              </button>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-2">
                No ingredients added yet. Click &quot;Add Ingredient&quot; to get started.
              </p>
            ) : (
              <div className="space-y-3 mb-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-end bg-white p-3 rounded-lg border border-teal-100">
                    {/* Ingredient Name */}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(index, "name", e.target.value)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Hilsa Fish"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="w-20">
                      <label className="block text-xs text-gray-600 mb-1">
                        Qty
                      </label>
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(index, "quantity", e.target.value)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="w-24">
                      <label className="block text-xs text-gray-600 mb-1">
                        Unit
                      </label>
                      <select
                        value={ingredient.unit}
                        onChange={(e) =>
                          updateIngredient(index, "unit", e.target.value)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="grams">grams</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="liters">liters</option>
                        <option value="pieces">pieces</option>
                        <option value="tsp">tsp</option>
                        <option value="tbsp">tbsp</option>
                        <option value="cup">cup</option>
                      </select>
                    </div>

                    {/* Cost */}
                    <div className="w-24">
                      <label className="block text-xs text-gray-600 mb-1">
                        Cost (৳)
                      </label>
                      <input
                        type="number"
                        value={ingredient.cost || 0}
                        onChange={(e) =>
                          updateIngredient(index, "cost", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Cost Summary */}
            {ingredients.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-teal-100 mt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Ingredient Cost</p>
                    <p className="text-lg font-bold text-orange-600">৳{totalIngredientCost.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Menu Price</p>
                    <p className="text-lg font-bold text-teal-600">৳{formData.currentPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Profit Margin</p>
                    <p className={`text-lg font-bold ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ৳{profitMargin.toFixed(0)} ({profitMarginPercent}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
            >
              {item ? "Update Menu Item" : "Add Menu Item"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
