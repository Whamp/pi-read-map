(ns my-app.core
  "Application core namespace."
  (:require [clojure.string :as str]
            [clojure.set :refer [union intersection]]))

(defprotocol Greetable
  "Protocol for things that can greet."
  (greet [this] "Returns a greeting string.")
  (farewell [this]))

(defrecord Person [name age]
  Greetable
  (greet [this] (str "Hello, I'm " name))
  (farewell [this] (str "Goodbye from " name)))

(deftype FastCounter [^:volatile-mutable cnt]
  clojure.lang.IDeref
  (deref [_] cnt))

(defn hello
  "Says hello to the given name."
  [name]
  (println (str "Hello, " name "!")))

(defn- private-helper
  "A private helper function."
  [x]
  (* x x))

(def my-constant
  "The answer to everything."
  42)

(def ^:private secret "hidden")

(defonce db-connection
  "Persistent database connection."
  (atom nil))

(defmacro unless
  "Evaluates body when pred is falsy."
  [pred & body]
  `(when (not ~pred) ~@body))

(defmulti area
  "Calculate area based on shape type."
  :shape)

(defmethod area :circle
  [{:keys [radius]}]
  (* Math/PI radius radius))

(defmethod area :rect
  [{:keys [w h]}]
  (* w h))

;; A regular comment, should not be treated as docstring
(defn no-docstring [x y]
  (+ x y))

(defn multi-arity
  "Function with multiple arities."
  ([x] (multi-arity x 1))
  ([x y] (+ x y)))
