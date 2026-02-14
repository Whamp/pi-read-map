(ns my-app.portable
  "Cross-platform namespace."
  (:require [clojure.string :as str]
            #?(:clj [clojure.java.io :as io]
               :cljs [cljs.reader :as reader])))

(defn shared-fn
  "Works on all platforms."
  [x]
  (str/upper-case x))

#?(:clj
   (defn platform-fn
     "JVM implementation."
     [x]
     (.toString x))
   :cljs
   (defn platform-fn
     "JS implementation."
     [x]
     (str x)))

#?(:clj
   (def ^:private jvm-secret 42))

#?(:clj
   (defn clj-only
     "JVM only function."
     [x]
     (Math/sqrt x))
   :cljs
   (defn cljs-only
     "JS only function."
     [x]
     (js/Math.sqrt x)))
